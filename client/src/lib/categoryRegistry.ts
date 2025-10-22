// Category registry for auto-linking to Fast-Track Request paths
export interface RequestCategory {
  id: string;
  name: string;
  patterns: string[]; // Keywords that should trigger this category
  path: string; // Fast-track request path with category
  description: string;
}

export const CATEGORY_REGISTRY: RequestCategory[] = [
  {
    id: "contract-review",
    name: "Contract Review",
    patterns: [
      "[contract review]",
      "[contract]"
    ],
    path: "/direct?category=contract_review",
    description: "Submit a contract review request"
  },
  {
    id: "marketing",
    name: "Marketing/Advertising Review",
    patterns: [
      "[marketing]",
      "[advertising]"
    ],
    path: "/direct?category=marketing",
    description: "Submit a marketing/advertising review request"
  },
  {
    id: "partnership",
    name: "Partnership/Vendor Questions",
    patterns: [
      "[partnership]",
      "[vendor]"
    ],
    path: "/direct?category=partnership",
    description: "Submit a partnership/vendor request"
  },
  {
    id: "employment",
    name: "Employment/HR Matters",
    patterns: [
      "[employment]",
      "[employment/HR matters]",
      "[HR]"
    ],
    path: "/direct?category=employment",
    description: "Submit an employment/HR request"
  },
  {
    id: "regulatory",
    name: "Regulatory/Compliance",
    patterns: [
      "[regulatory]",
      "[compliance]"
    ],
    path: "/direct?category=regulatory",
    description: "Submit a regulatory/compliance request"
  },
  {
    id: "ip",
    name: "Intellectual Property",
    patterns: [
      "[IP]",
      "[intellectual property]"
    ],
    path: "/direct?category=ip",
    description: "Submit an intellectual property request"
  },
  {
    id: "other",
    name: "Other Legal Matter",
    patterns: [
      "[other]",
      "[general legal]",
      "[other legal matter]"
    ],
    path: "/direct?category=other",
    description: "Submit a general legal request"
  }
];

// Function to detect categories in text
export function detectCategories(text: string): Array<{
  category: RequestCategory;
  match: string;
  startIndex: number;
  endIndex: number;
}> {
  const detections: Array<{
    category: RequestCategory;
    match: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  for (const category of CATEGORY_REGISTRY) {
    for (const pattern of category.patterns) {
      const lowerText = text.toLowerCase();
      const lowerPattern = pattern.toLowerCase();
      let startIndex = lowerText.indexOf(lowerPattern);

      while (startIndex !== -1) {
        detections.push({
          category,
          match: text.substring(startIndex, startIndex + pattern.length),
          startIndex,
          endIndex: startIndex + pattern.length
        });

        startIndex = lowerText.indexOf(lowerPattern, startIndex + 1);
      }
    }
  }

  // Sort by start index and remove overlaps
  detections.sort((a, b) => a.startIndex - b.startIndex);

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
