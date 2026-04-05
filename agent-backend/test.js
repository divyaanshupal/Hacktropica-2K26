async function triggerAiAgent() {
    console.log("Sending the Issue request to agent");
  
    const response = await fetch("http://localhost:5000/api/assign-task", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        
    //     {
    //     taskContext: "CRITICAL OUTAGE: The primary AWS Load Balancer just crashed. All production traffic is failing with 502 Bad Gateway errors. Need immediate traffic rerouting.",
    //     domain: "DevOps",
    //     priority: "Critical"
    //   }
    {
  "taskContext": "URGENT: Suspicious login attempts detected from multiple offshore IP addresses targeting the internal admin dashboard. Need immediate audit of access logs and temporary IP block implementation.",
  "domain": "Security",
  "priority": "High"
}
    )
    });
  
    const data = await response.json();
    console.log("\n🤖 AI RESPONSE:");
    console.dir(data, { depth: null, colors: true });
}
  
triggerAiAgent();