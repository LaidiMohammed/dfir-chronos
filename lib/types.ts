export interface Step {
  /** 1-based order */
  order: number;
  title: string;
  body: string;
  tools: string[];
}

export interface Module {
  slug: string;
  title: string;
  subtitle: string;
  /** 1-3 sentence visible description rendered under the title */
  description: string;
  objective: string;
  context: string;
  steps: Step[];
  deliverables: string[];
  tools: string[];
  /** Lucide icon name, e.g. "Clock", "Cpu", "Network", "Terminal" */
  icon: string;
}
