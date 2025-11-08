// Define the structure for a single menu item
export interface MenuItem {
  url: string;
  label: string;
}

// Define the structure for dropdown categories
export interface Dropdowns {
  [category: string]: MenuItem[];
}

// Define the structure for verification links (simple array)
export type VerificationLinks = MenuItem[];
// Dropdown data
export const dropdowns: Dropdowns = {
  "About Us": [
    { url: "/landing-page/history", label: "History" },
    { url: "/landing-page/mission-vision", label: "Mission, Vision, Value & Quality Statement" },
    { url: "/landing-page/core-business", label: "Core Business" },
    { url: "https://www.tesda.gov.ph/AboutL/TESDA/1280", label: "Road Map" },
    { url: "/landing-page/calendar-events", label: "Activities & Events" },
    { url: "/landing-page/structure", label: "Organizational Structure (Provincial Office Staffs)" },
    { url: "/landing-page/careers", label: "Careers" },
    { url: "/landing-page/pds-corner", label: "PD’s Corner" },
  ],
  "Programs & Services": [
    { url: "/landing-page/programs-services", label: "TVET Programs" },
    { url: "/landing-page/competency-standards", label: "Competency Standards Development" },
    { url: "/landing-page/competency-assessment-certification", label: "Competency Assessment and Certification" },
    { url: "/landing-page/program-registration-accreditation", label: "Program Registration and Accreditation" },
    { url: "/landing-page/directory-schools", label: "Directory of Schools with Registered Programs" },
    { url: "/landing-page/directory-trainers", label: "Directory of Accredited TVET Trainers" },
    { url: "/landing-page/training-regulations", label: "Training Regulations" },
    { url: "/landing-page/competency-standards", label: "Competency Standards" },
  ],
  "Transparency": [
    { url: "/landing-page/transparency-seal", label: "Transparency Seal" },
    { url: "/landing-page/citizens-charter", label: "Citizen’s Charter" },
    { url: "/landing-page/freedom-of-information", label: "Freedom of Information" },
    { url: "https://pqf.gov.ph/", label: "Philippine Qualifications Framework" },
    { url: "/landing-page/bagong-pilipinas", label: "Bagong Pilipinas" },
  ],
  "Resources": [
    { url: "https://www.tesda.gov.ph/About/TESDA/21992", label: "TESDA Circulars (Memo, Resolutions, Advisories, Orders)" },
    { url: "/landing-page/downloadable-files", label: "Downloadable Files (Forms and other files available for downloading)" },
  ],
  "Contacts": [
    { url: "/landing-page/contacts/central-office", label: "Central Office" },
    { url: "/landing-page/contacts/regional-office", label: "Regional Office" },
    { url: "/landing-page/contacts/occidental-mindoro-tti", label: "Occidental Mindoro TESDA Training Institute" },
    { url: "/landing-page/contacts/ttis", label: "TTIs" },
    { url: "/landing-page/contacts/tvis", label: "TVIs" },
    { url: "/landing-page/contacts/board-members", label: "Board Members" },
  ],
};

// Verification links
export const verificationLinks: VerificationLinks = [
  { url: "https://www.tesda.gov.ph/Rwac/Rwac2017", label: "Registry of Certified Workers" },
  { url: "https://www.tesda.gov.ph/AssessmentCenters/", label: "Assessment Centers" },
  { url: "https://www.tesda.gov.ph/TVI", label: "TVI with Registered Programs" },
  { url: "https://www.tesda.gov.ph/About/TESDA/27876", label: "Institutions Issued with Cease and Desist Order" },
  { url: "https://www.tesda.gov.ph/CA", label: "Registry of Accredited Assessors" },
  { url: "https://www.tesda.gov.ph/NTTC", label: "Registry of Trainers with NTTC" },
];