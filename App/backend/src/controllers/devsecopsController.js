import axios from "axios";
import { query } from "../config/db.js";
import { getPipeline } from "../services/simulationService.js";
import { analyzeLog } from "../services/aiService.js";

const SERVICE_TIMEOUT_MS = 2500;

export async function getDevSecOps(req, res) {
  const [deployments, containers] = await Promise.all([
    query("SELECT * FROM deployments ORDER BY created_at DESC LIMIT 5"),
    getRuntimeContainers()
  ]);

  const pipeline = getPipeline();
  const aiDecision = await getAiDeploymentDecision(pipeline, deployments.rows, containers);

  return res.json({
    pipeline,
    deployments: deployments.rows,
    aiDecision,
    containers
  });
}

async function getRuntimeContainers() {
  const checks = await Promise.all([
    checkHttpService("frontend", "http://frontend/"),
    checkHttpService("backend", "http://backend:5000/health"),
    checkDatabase(),
    checkHttpService("ai-engine", process.env.AI_ENGINE_URL || "http://ai-engine:8000")
  ]);

  return checks.map((service) => ({
    ...service,
    cpu: service.status === "healthy" ? "live" : "n/a",
    memory: service.status === "healthy" ? service.latencyMs + "ms" : "timeout"
  }));
}

async function checkHttpService(name, url) {
  const started = Date.now();

  try {
    await axios.get(url, { timeout: SERVICE_TIMEOUT_MS });
    return { name, status: "healthy", latencyMs: Date.now() - started };
  } catch (error) {
    return {
      name,
      status: "degraded",
      latencyMs: Date.now() - started,
      detail: error.message
    };
  }
}

async function checkDatabase() {
  const started = Date.now();

  try {
    await query("SELECT 1");
    return { name: "postgres", status: "healthy", latencyMs: Date.now() - started };
  } catch (error) {
    return {
      name: "postgres",
      status: "degraded",
      latencyMs: Date.now() - started,
      detail: error.message
    };
  }
}

async function getAiDeploymentDecision(pipeline, deployments, containers) {
  const degradedServices = containers.filter((service) => service.status !== "healthy");
  const warningStages = pipeline.filter((stage) => ["warning", "degraded", "failed"].includes(stage.status));
  const latestDeployment = deployments[0];

  const message = [
    "DevSecOps deployment decision",
    "warnings=" + (warningStages.map((stage) => stage.name).join("|") || "none"),
    "degraded_services=" + (degradedServices.map((service) => service.name).join("|") || "none"),
    latestDeployment ? "latest_deployment=" + latestDeployment.environment + ":" + latestDeployment.status + ":risk-" + latestDeployment.risk_score : "latest_deployment=none"
  ].join("; ");

  const risk = await analyzeLog(message, "devsecops");
  const riskScore = Math.max(
    risk.risk_score,
    warningStages.length * 15,
    degradedServices.length * 25,
    latestDeployment?.risk_score || 0
  );

  let decision = "approve";
  if (riskScore >= 70 || degradedServices.length > 0) {
    decision = "manual-review";
  }
  if (riskScore >= 85 || degradedServices.length >= 2) {
    decision = "block";
  }

  return {
    decision,
    riskScore,
    riskLevel: risk.risk_level,
    source: risk.source || "ai-engine",
    reason: buildDecisionReason(warningStages, degradedServices, latestDeployment)
  };
}

function buildDecisionReason(warningStages, degradedServices, latestDeployment) {
  const reasons = [];

  if (warningStages.length) {
    reasons.push("Pipeline warnings: " + warningStages.map((stage) => stage.name).join(", "));
  }
  if (degradedServices.length) {
    reasons.push("Service health issues: " + degradedServices.map((service) => service.name).join(", "));
  }
  if (latestDeployment) {
    reasons.push("Latest deployment " + latestDeployment.environment + " reports " + latestDeployment.risk_score + "% risk");
  }

  return reasons.join(". ") || "All linked services are healthy and deployment risk is low";
}
