import { ProviderType } from '../../models/Provider';

// Define the structure for a single menu item
export interface MenuItem {
  url: string;
  label: string;
  queryParams?: { [key: string]: any };
}

// Define the structure for dropdown categories
export interface Dropdowns {
  [category: string]: MenuItem[];
}

// Define the structure for verification links
export type VerificationLinks = MenuItem[];

// Dropdown data with full queryParams for Programs & Services
export const dropdowns: Dropdowns = {
  'About Us': [
    { url: '/landing-page/history', label: 'HISTORY' },
    {
      url: '/landing-page/mission-vision',
      label: 'MISSION, VISION, VALUE & QUALITY STATEMENT',
    },
    { url: '/landing-page/core-business', label: 'CORE BUSINESS' },
    { url: 'https://www.tesda.gov.ph/AboutL/TESDA/1280', label: 'ROAD MAP' },
    { url: '/landing-page/calendar-events', label: 'ACTIVITIES & EVENTS' },
    {
      url: '/landing-page/structure',
      label: 'ORGANIZATIONAL STRUCTURE (PROVINCIAL OFFICE STAFFS)',
    },
    { url: '/landing-page/careers', label: 'CAREERS' },
    { url: '/landing-page/pds-corner', label: 'PD’S CORNER' },
  ],
  'Programs & Services': [
    {
      url: '/landing-page/provider',
      label: ProviderType.TVET,
      queryParams: {
        type: ProviderType.TVET,
      },
    },
    {
      url: '/landing-page/provider',
      label: ProviderType.PROVINCIAL,
      queryParams: {
        type: ProviderType.PROVINCIAL,
      },
    },
  ],

  Transparency: [
    { url: '/landing-page/transparency-seal', label: 'TRANSPARENCY SEAL' },
    { url: '/landing-page/citizens-charter', label: 'CITIZEN’S CHARTER' },
    { url: '/landing-page/philgeps-posting', label: 'PHILGEPS POSTINGS' },
  ],
  Resources: [
    {
      url: 'https://www.tesda.gov.ph/About/TESDA/21992',
      label: 'TESDA CIRCULARS (MEMO, RESOLUTIONS, ADVISORIES, ORDERS)',
    },
    {
      url: '/landing-page/downloadable-files',
      label:
        'DOWNLOADABLE FILES (FORMS AND OTHER FILES AVAILABLE FOR DOWNLOADING)',
    },
  ],
  Contacts: [
    { url: '/landing-page/contacts/central-office', label: 'CENTRAL OFFICE' },
    { url: '/landing-page/contacts/regional-office', label: 'REGIONAL OFFICE' },
    {
      url: '/landing-page/contacts/occidental-mindoro-tti',
      label: 'OCCIDENTAL MINDORO TESDA TRAINING INSTITUTE',
    },
    { url: '/landing-page/contacts/ttis', label: 'TTIS' },
    { url: '/landing-page/contacts/tvis', label: 'TVIS' },
    { url: '/landing-page/contacts/board-members', label: 'BOARD MEMBERS' },
  ],
};

// Verification links remain unchanged
export const verificationLinks: VerificationLinks = [
  {
    url: 'https://www.tesda.gov.ph/Rwac/Rwac2017',
    label: 'REGISTRY OF CERTIFIED WORKERS',
  },
  {
    url: 'https://www.tesda.gov.ph/AssessmentCenters/',
    label: 'ASSESSMENT CENTERS',
  },
  {
    url: 'https://www.tesda.gov.ph/TVI',
    label: 'TVI WITH REGISTERED PROGRAMS',
  },
  {
    url: 'https://www.tesda.gov.ph/About/TESDA/27876',
    label: 'INSTITUTIONS ISSUED WITH CEASE AND DESIST ORDER',
  },
  {
    url: 'https://www.tesda.gov.ph/CA',
    label: 'REGISTRY OF ACCREDITED ASSESSORS',
  },
  {
    url: 'https://www.tesda.gov.ph/NTTC',
    label: 'REGISTRY OF TRAINERS WITH NTTC',
  },
];
