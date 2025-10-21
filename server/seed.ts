import { db } from "./db";
import { attorneys, knowledgeArticles } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const attorneyData = [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      title: "Senior Contracts Attorney",
      photoUrl: "",
      expertise: ["Contracts", "Vendor Agreements", "NDAs"],
      availability: "available"
    },
    {
      name: "Michael Chen",
      email: "michael.chen@company.com",
      title: "Marketing Counsel",
      photoUrl: "",
      expertise: ["Marketing", "Advertising", "Social Media"],
      availability: "available"
    },
    {
      name: "Jennifer Williams",
      email: "jennifer.williams@company.com",
      title: "Employment Law Specialist",
      photoUrl: "",
      expertise: ["Employment", "HR", "Labor Law"],
      availability: "available"
    }
  ];

  const existingAttorneys = await db.select().from(attorneys);
  if (existingAttorneys.length === 0) {
    await db.insert(attorneys).values(attorneyData);
    console.log("✓ Seeded attorneys");
  } else {
    console.log("✓ Attorneys already exist");
  }

  const articleData = [
    {
      title: "Referential Use of Trademarks in Marketing Content",
      slug: "trademark-referential-use",
      content: `# Referential Use of Trademarks in Marketing Content

## Overview
You can reference competitor names and trademarks in your marketing materials under certain circumstances without obtaining permission. This is known as "referential" or "nominative" use of trademarks.

## When It's Allowed
Referential use is generally permissible when:
1. The product or service cannot be easily identified without using the trademark
2. Only the necessary portion of the trademark is used
3. The use does not suggest sponsorship or endorsement

## Best Practices
- Use competitors' names factually and accurately
- Avoid using their logos or stylized marks
- Include disclaimers when appropriate
- Focus on truthful comparisons
- Don't imply affiliation or endorsement

## Examples
✓ "Works with iPhone and Android devices"
✓ "Import data from Salesforce"
✓ "Faster than leading competitors"

✗ Using competitor logos
✗ Suggesting partnership when none exists
✗ Making false comparative claims

## When to Seek Review
Contact legal if:
- Making direct comparison claims
- Using competitor trademarks prominently
- Creating parody or critical content
- Unsure about fair use boundaries`,
      excerpt: "Learn when and how you can reference competitor names and trademarks in your marketing materials without infringement.",
      category: "Marketing",
      tags: ["Trademarks", "Marketing", "Compliance"],
      readTime: 5,
      viewCount: 342,
      helpfulCount: 87,
      notHelpfulCount: 5
    },
    {
      title: "Standard NDA Template and Usage Guidelines",
      slug: "nda-template-guide",
      content: `# Standard NDA Template and Usage Guidelines

## Pre-Approved Template
Our standard mutual NDA template has been pre-approved for most vendor relationships and partnership discussions.

## When You Can Use It
The standard template is appropriate for:
- Vendor/supplier relationships
- Partnership exploration discussions
- Technology evaluation processes
- Standard business development conversations

## When Legal Review Is Required
Seek legal review if:
- The other party requests significant modifications
- Deal value exceeds $500,000
- Involves highly sensitive IP or trade secrets
- International jurisdiction considerations
- Non-standard confidentiality terms requested

## Key Terms Explained
- **Mutual vs Unilateral**: Our standard is mutual (both parties protect information)
- **Term Length**: Typically 2-3 years from disclosure date
- **Exclusions**: Public information, independently developed, legally required disclosure
- **Return/Destruction**: Obligations upon termination

## Download and Usage
1. Download the template from the knowledge base
2. Fill in party names and dates
3. Ensure both parties sign
4. Store executed copy in contract management system

## Common Modifications
If the other party requests:
- Longer confidentiality period → Usually acceptable up to 5 years
- Broader definition of confidential information → Requires review
- Non-solicitation clauses → Requires legal review
- Exclusivity provisions → Requires legal review`,
      excerpt: "Download our pre-approved NDA template and learn when you can use it without legal review.",
      category: "Contracts",
      tags: ["NDA", "Templates", "Contracts"],
      readTime: 4,
      viewCount: 521,
      helpfulCount: 143,
      notHelpfulCount: 8
    },
    {
      title: "Social Media Contest Legal Requirements",
      slug: "social-media-contest-rules",
      content: `# Social Media Contest Legal Requirements

## Overview
Running contests on social media platforms requires compliance with multiple regulations, platform rules, and state laws.

## Federal Requirements
- **No Purchase Necessary**: Sweepstakes cannot require purchase
- **Official Rules**: Must publish complete terms
- **Disclosures**: Clear explanation of odds, prizes, eligibility
- **Registration**: Some states require contest registration and bonding

## Platform-Specific Rules
Each platform has specific requirements:

### Instagram/Facebook
- Must include complete rules
- Can't require sharing to personal timeline
- Must use "Like" not "favorite"
- Include platform disclaimer

### Twitter/X
- Multiple account rules
- Retweet/like limitations
- Hashtag requirements

### TikTok
- Age restrictions (18+)
- Content guidelines
- Branded content policies

## Required Disclosures
Your official rules must include:
- No purchase necessary statement
- Eligibility requirements (age, location)
- Entry period (start and end dates)
- How to enter and winner selection
- Prize details and approximate retail value
- Odds of winning
- Winner notification process
- Sponsor information

## State Law Considerations
- New York and Florida require registration for prizes over $5,000
- Some states restrict certain prize types
- Age requirements vary by state
- Consider geographic restrictions

## Best Practices
1. Draft official rules document
2. Host rules on your website
3. Include platform disclaimers
4. Screen winners before announcement
5. Require affidavit of eligibility
6. Document the selection process
7. Fulfill prizes promptly

## When to Seek Legal Review
Always get legal review for:
- Prize value over $5,000
- Alcohol-related prizes
- International participants
- User-generated content contests
- Skill-based competitions
- Influencer partnerships`,
      excerpt: "Everything you need to know about running compliant giveaways and contests on social platforms.",
      category: "Marketing",
      tags: ["Social Media", "Contests", "Sweepstakes"],
      readTime: 7,
      viewCount: 289,
      helpfulCount: 76,
      notHelpfulCount: 12
    },
    {
      title: "Privacy Policy Updates: GDPR & CCPA Compliance",
      slug: "privacy-policy-gdpr-ccpa",
      content: `# Privacy Policy Updates: GDPR & CCPA Compliance

## Overview
When collecting data from EU and California residents, specific requirements must be met under GDPR and CCPA regulations.

## GDPR Requirements (EU)
The General Data Protection Regulation applies to:
- Businesses with EU operations
- Companies targeting EU residents
- Processing EU resident data

### Key Obligations
- **Lawful Basis**: Identify legal basis for processing
- **Consent**: Explicit consent for certain processing
- **Data Subject Rights**: Right to access, delete, portability
- **Data Protection Officer**: Required for certain organizations
- **Breach Notification**: 72-hour reporting requirement
- **Privacy by Design**: Build privacy into systems

## CCPA Requirements (California)
The California Consumer Privacy Act provides:
- Right to know what data is collected
- Right to deletion
- Right to opt-out of sale
- Right to non-discrimination

### Covered Businesses
CCPA applies if you meet any threshold:
- $25M+ annual revenue
- 100,000+ California consumers/households
- 50%+ revenue from selling consumer data

## Required Privacy Policy Elements
Your policy must disclose:
1. Categories of personal information collected
2. Sources of information
3. Business purposes for collection
4. Categories of third parties receiving data
5. Data retention periods
6. User rights and how to exercise them
7. Contact information for privacy inquiries

## Cookie Consent Requirements
- GDPR requires opt-in consent
- Must explain cookie purposes
- Allow granular consent choices
- Honor "Do Not Track" signals (CCPA)

## Data Processing Agreements
When using vendors:
- Require GDPR-compliant DPAs
- Verify adequate security measures
- Confirm data transfer mechanisms
- Review sub-processor lists

## Common Compliance Gaps
- Missing consent mechanisms
- Inadequate breach response plans
- Unclear data retention policies
- No data inventory/mapping
- Missing vendor agreements

## Action Items
1. Audit current data collection practices
2. Update privacy policy with required disclosures
3. Implement consent management
4. Create data subject request process
5. Review vendor contracts
6. Train staff on privacy obligations`,
      excerpt: "Key requirements for privacy policies when collecting data from EU and California residents.",
      category: "Privacy",
      tags: ["Privacy", "GDPR", "CCPA", "Data Protection"],
      readTime: 8,
      viewCount: 412,
      helpfulCount: 95,
      notHelpfulCount: 7
    }
  ];

  const existingArticles = await db.select().from(knowledgeArticles);
  if (existingArticles.length === 0) {
    await db.insert(knowledgeArticles).values(articleData);
    console.log("✓ Seeded knowledge articles");
  } else {
    console.log("✓ Knowledge articles already exist");
  }

  console.log("Database seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
