// Define the project data structure
export interface ProjectData extends Record<string, unknown> {
  name: string
  developerId: string
  developerCif: string
  developerName: string
  projectStatus: string
  approvalStatus: string
}

// Project data matching the screenshot
export const projectsData: ProjectData[] = [
  {
    name: 'Al Madina',
    developerId: '12345677',
    developerCif: '656567',
    developerName: 'AlNaboodah Construction Group',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'Palm Residency',
    developerId: '30303030',
    developerCif: '7623423',
    developerName: 'Sobha Realty Test RR',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Incomplete',
  },
  {
    name: 'Beverly Hills Drive',
    developerId: '78688888',
    developerCif: '2222222222222222',
    developerName: 'Wasl Asset Management',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Dubai Marina',
    developerId: '78787878',
    developerCif: '767868',
    developerName: 'Emaar Builder Pvt Ltd',
    projectStatus: 'FREEZED',
    approvalStatus: 'In Review',
  },
  {
    name: 'Safa Two De Grisogono',
    developerId: '12121212',
    developerCif: '1231231231',
    developerName: 'Nakheel Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'Chic Tower',
    developerId: '12131212',
    developerCif: '123120000',
    developerName: 'Aziz Development',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Saadiyat Island',
    developerId: '12121212',
    developerCif: '1231231231',
    developerName: 'Nakheel Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Incomplete',
  },
  {
    name: 'Elegance Tower',
    developerId: '98765430',
    developerCif: '34527890',
    developerName: 'Ellington Properties',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Pro Extention New Test',
    developerId: '51283456',
    developerCif: 'L0094934343434',
    developerName: 'Green Group',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'Yas Island',
    developerId: '1235678',
    developerCif: '12345678',
    developerName: 'Ellington Properties',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Marina Heights',
    developerId: '87654321',
    developerCif: '87654321',
    developerName: 'Emaar Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Rejected',
  },
  {
    name: 'Palm Jumeirah',
    developerId: '11223344',
    developerCif: '11223344',
    developerName: 'Nakheel Properties',
    projectStatus: 'FREEZED',
    approvalStatus: 'In Review',
  },
  {
    name: 'Downtown Dubai',
    developerId: '55667788',
    developerCif: '55667788',
    developerName: 'Emaar Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'JBR Walk',
    developerId: '99887766',
    developerCif: '99887766',
    developerName: 'Meraas Holding',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Bluewaters Island',
    developerId: '44332211',
    developerCif: '44332211',
    developerName: 'Meraas Holding',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Incomplete',
  },
  {
    name: 'City Walk',
    developerId: '66778899',
    developerCif: '66778899',
    developerName: 'Meraas Holding',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'La Mer',
    developerId: '22334455',
    developerCif: '22334455',
    developerName: 'Meraas Holding',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
  {
    name: 'Dubai Hills Estate',
    developerId: '77889900',
    developerCif: '77889900',
    developerName: 'Emaar Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'In Review',
  },
  {
    name: 'Arabian Ranches',
    developerId: '33445566',
    developerCif: '33445566',
    developerName: 'Emaar Properties',
    projectStatus: 'ACTIVE',
    approvalStatus: 'Approved',
  },
  {
    name: 'Emirates Hills',
    developerId: '88990011',
    developerCif: '88990011',
    developerName: 'Emaar Properties',
    projectStatus: 'CLOSED',
    approvalStatus: 'Approved',
  },
]

// Data loader function for useDataLoader hook
export const projectsDataLoader = () => Promise.resolve(projectsData) 