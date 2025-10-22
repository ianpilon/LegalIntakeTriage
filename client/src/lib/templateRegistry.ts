// Template registry for auto-linking in chat responses
export interface Template {
  id: string;
  name: string;
  patterns: string[]; // Text patterns that should trigger this link
  path: string; // Where to navigate
  description: string; // Description shown in confirmation dialog
}

export const TEMPLATE_REGISTRY: Template[] = [
  {
    id: "standard-nda",
    name: "Standard NDA Template",
    patterns: [
      "Standard NDA Template and Usage Guidelines",
      "standard NDA template",
      "standard mutual NDA template",
      "pre-approved NDA",
      "mutual NDA template"
    ],
    path: "/knowledge/nda-template-guide",
    description: "View the pre-approved standard NDA template and usage guidelines"
  },
  {
    id: "privacy-policy",
    name: "Privacy Policy",
    patterns: [
      "Privacy Policy Updates",
      "GDPR & CCPA Compliance",
      "privacy policy"
    ],
    path: "/knowledge/privacy-policy-gdpr-ccpa",
    description: "View privacy policy and compliance guidelines"
  },
  {
    id: "trademark-use",
    name: "Trademark Usage",
    patterns: [
      "Referential Use of Trademarks",
      "trademark usage",
      "trademark guidelines"
    ],
    path: "/knowledge/trademark-referential-use",
    description: "View trademark usage guidelines for marketing"
  },
  {
    id: "social-media-contests",
    name: "Social Media Contest Rules",
    patterns: [
      "Social Media Contest Legal Requirements",
      "contest rules",
      "social media contest"
    ],
    path: "/knowledge/social-media-contest-rules",
    description: "View legal requirements for social media contests"
  }
  // Add more templates as needed
];

// Function to detect templates in text and return their links
export function detectTemplates(text: string): Array<{
  template: Template;
  match: string;
  startIndex: number;
  endIndex: number;
}> {
  const detections: Array<{
    template: Template;
    match: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  for (const template of TEMPLATE_REGISTRY) {
    for (const pattern of template.patterns) {
      // Case-insensitive search
      const lowerText = text.toLowerCase();
      const lowerPattern = pattern.toLowerCase();
      let startIndex = lowerText.indexOf(lowerPattern);

      while (startIndex !== -1) {
        detections.push({
          template,
          match: text.substring(startIndex, startIndex + pattern.length),
          startIndex,
          endIndex: startIndex + pattern.length
        });

        // Look for more occurrences
        startIndex = lowerText.indexOf(lowerPattern, startIndex + 1);
      }
    }
  }

  // Sort by start index to handle overlaps correctly
  detections.sort((a, b) => a.startIndex - b.startIndex);

  // Remove overlapping detections (keep the first one)
  const nonOverlapping: typeof detections = [];
  let lastEnd = -1;

  for (const detection of detections) {
    if (detection.startIndex >= lastEnd) {
      nonOverlapping.push(detection);
      lastEnd = detection.endIndex;
    }
  }

  return nonOverlapping;
}
