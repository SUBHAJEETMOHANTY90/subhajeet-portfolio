export const profile = {
  name: "Subhajeet Mohanty",
  title: "Senior Performance Engineer",
  tagline: "Transforming performance bottlenecks into scalable business solutions.",
  location: "Pune, Maharashtra, India",
  email: "subhajeetmohanty333@gmail.com",
  phone: "+91-9960119555",
  linkedin: "https://www.linkedin.com/in/subhajeet-mohanty",
  resume: "/resume.pdf",
  photo: "/profile.jpg",
  philosophy:
    "Performance is not about making systems faster; it is about ensuring business reliability at scale.",
  summary:
    "Senior Performance Engineer with 12 years of experience improving the reliability, scalability and user experience of business-critical applications across banking, retail, e-commerce, cloud, API, microservices and enterprise platforms. Skilled in performance testing, workload modelling, SLA/NFR validation, observability, bottleneck analysis and CI/CD-based performance checks. Hands-on with JMeter, LoadRunner, k6, Dynatrace, AppDynamics, Splunk, Grafana, Prometheus, Azure Application Insights, Lighthouse and JVM diagnostics — and increasingly applying AI-assisted analysis and reporting to accelerate root-cause insight and release-readiness decisions.",
};

export const stats = [
  { label: "Years of Experience", value: 12, suffix: "+" },
  { label: "Projects Delivered", value: 30, suffix: "+" },
  { label: "Load Tests Executed", value: 1200, suffix: "+" },
  { label: "Performance Issues Resolved", value: 150, suffix: "+" },
  { label: "Applications Optimized", value: 60, suffix: "+" },
];

export const businessImpact = [
  { label: "Response Time Improvement", value: "Up to 78% faster", detail: "Avg latency reduced across critical journeys" },
  { label: "Throughput Improvement", value: "3.5x higher TPS", detail: "Sustained peak-hour transaction rates" },
  { label: "Capacity Enhancement", value: "+300% headroom", detail: "Verified scalability under projected growth" },
  { label: "Cost Optimization", value: "$1.2M/yr saved", detail: "Rightsized infrastructure & cloud spend" },
];

export const skillCategories = [
  { category: "Performance Testing", items: ["JMeter", "LoadRunner", "k6", "Robot Framework", "BlazeMeter"] },
  { category: "Monitoring & Observability", items: ["Dynatrace", "AppDynamics", "Splunk", "Grafana", "Prometheus", "Azure App Insights"] },
  { category: "Frontend & Web Performance", items: ["Lighthouse", "WebPageTest", "Core Web Vitals", "React.js journeys", "Browser DevTools"] },
  { category: "JVM & App Diagnostics", items: ["GC Analysis", "Heap Dumps", "Thread Dumps", "Java Flight Recorder", "VisualVM"] },
  { category: "CI/CD & Automation", items: ["Jenkins", "Azure DevOps", "GitHub Actions", "CI/CD Perf Gates"] },
  { category: "Programming & Scripting", items: ["Java", "JavaScript", "Python", "PowerShell"] },
  { category: "Cloud & Infrastructure", items: ["Azure", "Kubernetes", "Linux/Windows VMs", "Containerized Workloads"] },
  { category: "Databases & Data", items: ["Oracle", "Azure Cosmos DB", "Azure Data Lake", "Big Data Workloads"] },
  { category: "AI for Performance", items: ["LLM-Assisted Reporting", "Automated Executive Summaries", "Anomaly Highlighting", "Trend Comparison"] },
];

export const experience = [
  { role: "Performance Testing", desc: "End-to-end load, stress, endurance and volume testing for mission-critical platforms." },
  { role: "Capacity Planning", desc: "Sizing and forecasting infrastructure for projected business growth." },
  { role: "Scalability Engineering", desc: "Designing systems that scale horizontally under peak demand." },
  { role: "Application Performance Monitoring", desc: "Instrumenting apps with Dynatrace/AppDynamics for deep observability." },
  { role: "Root Cause Analysis", desc: "Thread dumps, GC logs, DB metrics and network analysis to isolate bottlenecks." },
  { role: "Cloud Performance Engineering", desc: "Tuning AWS/Azure workloads for cost and performance." },
  { role: "Enterprise Banking Systems", desc: "SLA-driven performance for high-compliance financial platforms." },
  { role: "Retail Platforms", desc: "Peak-event readiness for high-traffic e-commerce systems." },
];

export const about = {
  headline: "I find the bottleneck everyone else missed — then make sure it never comes back.",
  bio: [
    "I'm a Senior Performance Engineer with 12 years spent making business-critical systems fast, stable and predictable under pressure. My path runs from regulated banking platforms, through high-traffic retail and e-commerce (currently H&M's core engineering), into cloud-native, API and microservices architectures.",
    "I love the moment a vague \"the app is slow\" complaint turns into a precise, measurable root cause — a blocked event loop, a starved connection pool, a missing index, a GC pause. Then I go one step further: turning that one fix into a reusable framework so the whole team ships performance, not just me.",
    "Lately I've been applying AI-assisted analysis and reporting to accelerate root-cause insight, anomaly detection and release-readiness decisions — pairing deep systems fundamentals with modern tooling.",
  ],
  strengths: [
    { title: "Deep Root-Cause Diagnosis", proof: "Traced a 3s Node.js event-loop stall to synchronous serialization — cut it to 500ms and eliminated OOM kills." },
    { title: "Peak-Event Readiness", proof: "Tuned SAP CAR and Kubernetes autoscaling to sustain 3x sale-day volume without throttling or backlog." },
    { title: "Reusable Performance Frameworks", proof: "Built a template + AI-assisted reporting that cut test setup from weeks to hours across teams." },
    { title: "Full-Stack Performance", proof: "From JVM GC and DB indexes to frontend Core Web Vitals (LCP 5.8s to 1.9s) — the whole request path." },
  ],
  principles: [
    "Measure, don't guess — every conclusion is backed by data.",
    "Define the SLO before scaling the infrastructure.",
    "Watch dispersion, not just averages — the mean hides the pain.",
    "Make the fix reusable — a framework beats a one-off.",
    "Translate deep findings into decisions everyone can act on.",
  ],
};

export const achievements = [
  {
    title: "Scaled SAP CAR for Peak Retail Sale Events",
    challenge: "SAP CAR (Customer Activity Repository) inbound POS processing and near-real-time inventory (BOPIS/omnichannel) fell behind during peak sale events, delaying stock accuracy and demand data.",
    investigation: "Traced POSDTA/POSDM inbound queues, HANA CPU and long-running aggregations, plus batch overlap with online journeys. Identified serialized inbound processing and unpartitioned high-volume tables as the bottleneck.",
    resolution: "Parallelized inbound task processing, tuned package sizes and HANA workload classes, rescheduled/decoupled heavy batch from peak windows, and validated with production-representative workload models.",
    fix: "Parallelized POS inbound and moved heavy batch out of the peak window — so real-time inventory stopped queuing.",
    outcome: [
      { k: "Inbound Backlog", v: "Cleared at peak" },
      { k: "Inventory Freshness", v: "Near real-time" },
      { k: "Peak Throughput", v: "Sustained 3x volume" },
    ],
  },
  {
    title: "Tuned Kubernetes Autoscaling for Sale Traffic",
    challenge: "Containerized retail microservices on Kubernetes were both over-provisioned off-peak and unstable at peak, with pods hitting CPU throttling and OOMKilled restarts during flash sales.",
    investigation: "Analyzed CPU throttling (CFS), memory working set vs. limits, HPA reaction lag and readiness/liveness behavior against real traffic ramps from load tests and observability data.",
    resolution: "Right-sized requests/limits from actual usage, tuned HPA (target utilization, stabilization windows) and added pre-scaling for known sale windows, plus PodDisruptionBudgets for safe rollout under load.",
    fix: "Right-sized CPU/memory limits and pre-scaled before sale windows — so pods stopped throttling and getting OOMKilled.",
    outcome: [
      { k: "OOMKills / Throttling", v: "Eliminated at peak" },
      { k: "Scale-up Lag", v: "Minutes to seconds" },
      { k: "Off-peak Cost", v: "Reduced via right-sizing" },
    ],
  },
  {
    title: "Reduced JVM GC Pauses in Java Microservice",
    challenge: "A core Java (Spring Boot) service showed periodic multi-second response spikes under sustained load, traced to long GC pauses and rising old-gen occupancy.",
    investigation: "GC log and heap analysis (JFR, VisualVM) showed frequent long pauses and premature promotion driven by an oversized short-lived allocation rate and undersized young generation.",
    resolution: "Switched to G1GC with tuned pause targets and region/young sizing, reduced allocation churn in hot paths, and bounded caches to stabilize old-gen growth.",
    fix: "Moved to G1GC with a pause target and cut allocation churn in hot paths — so multi-second GC spikes disappeared.",
    outcome: [
      { k: "GC Pause (P99)", v: "2.1s to ~200ms" },
      { k: "Response Spikes", v: "Eliminated" },
      { k: "Throughput", v: "Improved under sustained load" },
    ],
  },
  {
    title: "Eliminated Node.js Event Loop Blocking & OOM Kills",
    challenge: "A high-throughput Node.js service suffered event loop lag of ~3 seconds under peak load, leading to health-check failures and recurring OOM kills (pod restarts) that broke SLAs.",
    investigation: "Correlated event loop lag, RSS/heap growth and CPU profiles (clinic.js, --prof, heap snapshots). Root cause: large synchronous JSON serialization and unbounded in-memory accumulation blocking the single-threaded loop while heap climbed toward the container memory limit.",
    resolution: "Offloaded CPU-bound work to worker threads, switched to streaming/async serialization, bounded in-flight buffers with backpressure, and right-sized heap (--max-old-space-size) against pod limits.",
    fix: "Offloaded blocking JSON work to worker threads and added backpressure — so the event loop stayed responsive and heap stopped hitting the OOM limit.",
    outcome: [
      { k: "Event Loop Lag", v: "3s to 500ms" },
      { k: "OOM Kills", v: "Eliminated" },
      { k: "P95 Latency", v: "-68%" },
    ],
  },
  {
    title: "Resolved Solace Message Consumption Lag",
    challenge: "Solace queue depth grew continuously during peak load as consumers fell behind, causing multi-minute backlog and downstream SLA breaches.",
    investigation: "Profiled consumer flow, acknowledgement mode and max-unacked (prefetch) window. Found single-threaded, client-ack consumption with blocking handlers throttling the flow window and serializing throughput.",
    resolution: "Scaled consumer concurrency, tuned flow window / max-unacked-messages, batched acknowledgements, and made handlers non-blocking with bounded parallelism.",
    fix: "Raised consumer concurrency and the max-unacked window with batched acks — so consumers kept pace and the queue drained.",
    outcome: [
      { k: "Queue Backlog", v: "Cleared" },
      { k: "Consumption Rate", v: "+4x" },
      { k: "End-to-End Delay", v: "Minutes to seconds" },
    ],
  },
  {
    title: "Identified Missing Database Indexes",
    challenge: "Key API endpoints degraded sharply as data volume grew, with database CPU saturating during peak traffic.",
    investigation: "Execution-plan analysis exposed full-table scans on high-cardinality filter and join columns lacking supporting indexes.",
    resolution: "Recommended and validated composite indexes aligned to query predicates via EXPLAIN plans, then confirmed gains under load test.",
    fix: "Added composite indexes matching the query predicates — so full-table scans became index seeks and DB CPU dropped.",
    outcome: [
      { k: "Query Time", v: "3.4s to 120ms" },
      { k: "DB CPU", v: "-60%" },
      { k: "Access Path", v: "Full scan to index seek" },
    ],
  },
  {
    title: "Optimized Frontend Page Load & Core Web Vitals",
    challenge: "Customer-facing pages had slow first render and poor Core Web Vitals, with heavy JS bundles hurting conversion on mobile.",
    investigation: "Lighthouse and WebPageTest profiling revealed render-blocking scripts, oversized bundles, unoptimized images and layout shift from late-loading assets.",
    resolution: "Introduced code-splitting and lazy loading, deferred non-critical JS, optimized/served next-gen images, and added caching + preloading of critical assets.",
    fix: "Code-split the bundle and deferred non-critical JS while preloading critical assets — so first render and LCP improved sharply.",
    outcome: [
      { k: "LCP", v: "5.8s to 1.9s" },
      { k: "JS Bundle", v: "-45%" },
      { k: "Lighthouse Perf", v: "48 to 94" },
    ],
  },
  {
    title: "Built a Reusable Performance Engineering Template",
    challenge: "Every project reinvented performance testing from scratch — inconsistent scripts, ad-hoc monitoring and manual reports slowed delivery and made results hard to compare across teams.",
    investigation: "Reviewed recurring effort across engagements and found the same building blocks repeated: workload modelling, parameterized test scripts, monitoring dashboards, CI/CD wiring and stakeholder reporting.",
    resolution: "Created a reusable framework — parameterized JMeter/k6 test templates, standard workload-model definitions, ready-made Grafana/Dynatrace dashboards, CI/CD pipeline steps (Jenkins/Azure DevOps/GitHub Actions) and an AI-assisted report generator that summarizes results, flags anomalies and drafts release-readiness reports.",
    fix: "Packaged the whole test-to-report flow into reusable templates plus AI-assisted reporting — so new projects start in hours, not weeks, with consistent, comparable results.",
    outcome: [
      { k: "Test Setup Time", v: "Weeks to hours" },
      { k: "Reporting Effort", v: "Largely automated" },
      { k: "Consistency", v: "Standard across teams" },
    ],
  },
];

export const caseStudies = [
  {
    slug: "banking-core",
    title: "Core Banking Peak-Load Readiness",
    context: "A tier-1 bank needed guaranteed sub-2s response for fund transfers during salary-day surges.",
    challenge: "Transaction latency spiked to 9s at 12k concurrent users with rising error rates.",
    strategy: ["Load Testing", "Stress Testing", "Endurance Testing", "Volume Testing"],
    investigation: ["CPU saturation on app tier", "Heap growth in old gen", "Long GC pauses (2.4s)", "DB row-lock contention"],
    rootCause: "Undersized connection pool combined with an unbounded in-memory cache causing frequent full GC.",
    resolution: "Tuned G1GC, bounded cache with eviction, scaled connection pool and added read replicas.",
    results: [
      { metric: "P95 Latency", before: "9.0s", after: "1.7s" },
      { metric: "Throughput", before: "820 TPS", after: "2900 TPS" },
      { metric: "Error Rate", before: "4.8%", after: "0.05%" },
      { metric: "GC Pause", before: "2.4s", after: "180ms" },
    ],
  },
  {
    slug: "retail-blackfriday",
    title: "Retail Black Friday Scalability",
    context: "A retail platform expected 8x normal traffic during Black Friday flash sales.",
    challenge: "Product and cart services degraded above 20k concurrent shoppers.",
    strategy: ["Load Testing", "Stress Testing", "Volume Testing"],
    investigation: ["Thread pool exhaustion", "Downstream API timeouts", "Redis hot keys", "Network egress limits"],
    rootCause: "Synchronous downstream calls saturated the servlet thread pool under burst load.",
    resolution: "Introduced async I/O, circuit breakers, cache warming and autoscaling policies.",
    results: [
      { metric: "Concurrent Users", before: "20k", after: "160k" },
      { metric: "Cart P95", before: "6.5s", after: "0.9s" },
      { metric: "Availability", before: "97.1%", after: "99.98%" },
      { metric: "Conversion", before: "baseline", after: "+18%" },
    ],
  },
];

export const warStories = [
  {
    title: "Black Friday Traffic Surge",
    problem: "Traffic spiked 8x within minutes of a flash-sale launch.",
    symptoms: "Rising 5xx errors, cart timeouts, alert storms.",
    analysis: "APM showed thread pool saturation and downstream latency amplification.",
    rootCause: "Synchronous downstream calls blocking servlet threads.",
    actions: "Enabled async processing, circuit breakers and pre-scaled the fleet.",
    outcome: "Zero downtime, +18% conversion, record sales day.",
  },
  {
    title: "Production Outage Investigation",
    problem: "Intermittent full outage of a payment service at 2 AM.",
    symptoms: "Health checks flapping, connection resets.",
    analysis: "Correlated logs, thread dumps and DB waits.",
    rootCause: "Connection leak exhausting the DB pool over hours.",
    actions: "Fixed leak, added pool metrics and leak-detection alerts.",
    outcome: "MTTR reduced from 4h to under 15 minutes.",
  },
  {
    title: "Critical Memory Leak",
    problem: "Heap climbed steadily until OOM crashes every 36 hours.",
    symptoms: "Rising old-gen usage, frequent full GC, restarts.",
    analysis: "Heap dump analysis with MAT pinpointed retained listeners.",
    rootCause: "Unremoved event listeners retained large object graphs.",
    actions: "Deregistered listeners, added weak references and heap alerts.",
    outcome: "Stable memory profile, zero OOM incidents since.",
  },
  {
    title: "Database Deadlock Incident",
    problem: "Batch jobs randomly failed with deadlock victims.",
    symptoms: "Deadlock errors, stalled queues, SLA breaches.",
    analysis: "Deadlock graphs revealed inconsistent lock ordering.",
    rootCause: "Two transactions acquired locks in opposite order.",
    actions: "Standardized lock ordering and reduced transaction scope.",
    outcome: "Deadlocks eliminated, batch throughput +40%.",
  },
  {
    title: "JVM Thread Pool Exhaustion",
    problem: "Requests queued and timed out under moderate load.",
    symptoms: "High latency, rejected executions, low CPU.",
    analysis: "Thread dumps showed threads blocked on a slow external API.",
    rootCause: "Unbounded blocking calls with no timeout budget.",
    actions: "Added timeouts, bulkheads and a dedicated thread pool.",
    outcome: "Latency stabilized, capacity doubled.",
  },
  {
    title: "Connection Pool Saturation",
    problem: "Login flow slowed to a crawl during peak.",
    symptoms: "Long waits acquiring DB connections.",
    analysis: "Dynatrace showed pool wait times over 6s.",
    rootCause: "Pool sized for average, not peak concurrency.",
    actions: "Right-sized pool, added read replicas and caching.",
    outcome: "Login latency 8s to 1.8s, +300% capacity.",
  },
  {
    title: "Microservice Bottleneck Discovery",
    problem: "One slow service dragged down the whole checkout chain.",
    symptoms: "Cascading latency across services.",
    analysis: "Distributed tracing isolated a chatty N+1 call pattern.",
    rootCause: "Fan-out calls without batching or caching.",
    actions: "Introduced batching, caching and request coalescing.",
    outcome: "End-to-end latency reduced by 62%.",
  },
];

export const workHistory = [
  {
    company: "Tata Consultancy Services",
    role: "Senior Performance Engineer / Technical Consultant",
    client: "H&M Core Engineering",
    period: "Dec 2021 – Present",
    points: [
      "Lead performance engineering for large-scale retail, e-commerce, API, microservices, SAP Hybris/CAR, BOPIS, cloud and data-platform systems.",
      "Define NFRs, SLA/SLO expectations, workload models, transaction mixes and release-readiness benchmarks.",
      "Run load, stress, soak, spike, scalability, endurance and failover tests with JMeter, LoadRunner, k6 and Robot Framework.",
      "Analyse frontend/React.js journeys with Lighthouse, WebPageTest and observability data to isolate rendering, latency and caching bottlenecks.",
      "Perform JVM diagnostics (GC logs, heap/thread dumps, Java Flight Recorder, VisualVM) and provide tuning recommendations.",
      "Built AI-assisted reporting to summarise results, highlight anomalies, compare trends and prepare release-readiness reports.",
      "Mentor performance engineers and contribute to Community of Practice standards.",
    ],
  },
  {
    company: "Cybage Software",
    role: "Lead Performance Engineer",
    client: "TechData",
    period: "Dec 2018 – Dec 2021",
    points: [
      "Led performance delivery for enterprise, API, frontend, backend, cloud and data-heavy workflows.",
      "Prepared NFRs, workload models, test strategies, execution plans and reporting structures.",
      "Designed and executed tests with JMeter, LoadRunner, BlazeMeter, Robot Framework, WebPageTest and Lighthouse.",
      "Integrated performance testing into Azure DevOps and Jenkins pipelines for repeatable validation and regression detection.",
      "Used Dynatrace, AppDynamics, Grafana, Prometheus, Splunk and Azure App Insights for bottleneck analysis and readiness reviews.",
      "Mentored engineers and contributed to the performance Centre of Excellence.",
    ],
  },
  {
    company: "Softenger",
    role: "Senior Performance Engineer",
    client: "ICICI Banking System",
    period: "Apr 2017 – Dec 2018",
    points: [
      "Delivered end-to-end performance testing and tuning for banking, payment, API, web service and backend systems.",
      "Created and executed JMeter and LoadRunner scripts for UI, API, web service and payment workflows.",
      "Supported validation in a regulated banking environment focused on stability, reliability and throughput.",
      "Performed JVM diagnostics (GC, heap/thread dumps) and production stability support.",
    ],
  },
  {
    company: "Sparken IT Solutions Pvt. Ltd",
    role: "Performance Engineer",
    client: "",
    period: "Sep 2014 – Apr 2017",
    points: [
      "Performed UI, API and mobile service performance testing with JMeter across web and service-based applications.",
      "Supported regression automation with Selenium and contributed to execution planning and result validation.",
      "Analysed logs with Splunk and prepared KPI/benchmark reports; supported Java profiling under load.",
    ],
  },
];

export const education = [
  { school: "BRM Institute of Engineering and Technology, Bhubaneswar, Odisha", qualification: "B.Tech, Computer Science", period: "2009 – 2013" },
  { school: "NIIS Junior College, Bhubaneswar", qualification: "Higher Secondary", period: "2007 – 2009" },
  { school: "K.P.S, Jamshedpur", qualification: "Senior Secondary", period: "2005 – 2007" },
];

export const certifications = [
  { name: "Claude Builder Certification", org: "Anthropic", date: "2026", credentialId: "", file: "", badgeId: "1fa5e443-55ab-4bc1-badc-00b6639bc89f" },
  { name: "ISTQB Certified Tester", org: "ISTQB", date: "", credentialId: "", file: "", badgeId: "" },
  { name: "Microsoft Certified: Azure Fundamentals (AZ-900)", org: "Microsoft", date: "", credentialId: "", file: "", badgeId: "b8a09ed2-4f52-42a4-8b72-c34282d7eeb8" },
  { name: "Microsoft Certified: Azure Administrator Associate (AZ-104)", org: "Microsoft", date: "", credentialId: "", file: "", badgeId: "891c46dd-3ef7-4248-b7c6-dda766b924a2" },
];

export const successStories = [
  { challenge: "8s login latency", rootCause: "DB connection pool starvation", solution: "Tuned JDBC pool + indexing", impact: "Faster, reliable logins", metrics: "8s to 1.8s, +300% capacity" },
  { challenge: "Black Friday outages", rootCause: "Thread pool saturation", solution: "Async I/O + autoscaling", impact: "Record sales day", metrics: "20k to 160k users, +18% conversion" },
  { challenge: "36h OOM crashes", rootCause: "Listener memory leak", solution: "Weak refs + cleanup", impact: "Stable production", metrics: "Zero OOM since" },
  { challenge: "Payment outages", rootCause: "DB connection leak", solution: "Leak fix + monitoring", impact: "Faster recovery", metrics: "MTTR 4h to 15m" },
  { challenge: "Batch deadlocks", rootCause: "Inconsistent lock order", solution: "Standardized locking", impact: "Reliable batches", metrics: "Deadlocks to zero, +40%" },
  { challenge: "Checkout timeouts", rootCause: "Lock contention", solution: "Lock-free caching", impact: "Recovered revenue", metrics: "Errors 6.2% to 0.1%" },
  { challenge: "High cloud cost", rootCause: "Over-provisioning", solution: "Right-sizing + HPA", impact: "Major cost savings", metrics: "-38% spend" },
  { challenge: "Slow checkout chain", rootCause: "N+1 fan-out calls", solution: "Batching + caching", impact: "Snappy checkout", metrics: "-62% latency" },
  { challenge: "GC pauses of 2.4s", rootCause: "Unbounded cache + GC", solution: "G1GC tuning + eviction", impact: "Smooth throughput", metrics: "GC 2.4s to 180ms" },
  { challenge: "API thread exhaustion", rootCause: "Blocking external calls", solution: "Timeouts + bulkheads", impact: "Doubled capacity", metrics: "2x throughput" },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/achievements", label: "Achievements" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/perf-template", label: "What I Built" },
  { href: "/war-stories", label: "War Stories" },
  { href: "/success-stories", label: "Top 10" },
  { href: "/certifications", label: "Certifications" },
  { href: "/resume", label: "Resume" },
  { href: "/contact", label: "Contact" },
];
