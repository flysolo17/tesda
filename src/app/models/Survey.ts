import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Survey {
  id: string;
  name: string;
  profile?: string | null;
  uid: string;
  location: string;
  programType: ProgramType;
  program: TrainingProgram;
  comment: string;
  submittedAt: Date;
}

export const SurveyConverter = {
  toFirestore: (data: Survey) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Survey;
    data.submittedAt = (data.submittedAt as any).toDate();
    return data;
  },
};

export enum ProgramType {
  Training = 'TRAINING',
  Assessment = 'ASSESSMENT',
}
export enum TrainingProgram {
  AgriculturalCropsProductionsNCI = 'AGRICULTURAL CROPS PRODUCTIONS NC I',
  AgroentrepreneurshipNCII = 'AGROENTREPRENEURSHIP NC II',
  AnimalProductionPoultryChickenNCII = 'ANIMAL PRODUCTION (POULTY-CHICKEN) NC II',
  AnimalProductionSwineNCII = 'ANIMAL PRODUCTION (SWINE) NC II',
  AssemblyOfSolarNightlightAndPostLamp = 'ASSEMBLY OF SOLAR NIGHTLIGHT AND POST LAMP',
  AutomotiveServicingChassisRepairNCII = 'AUTOMOTIVE SERVICING (CHASSIS REPAIR) NC II',
  AutomotiveServicingNCI = 'AUTOMOTIVE SERVICING NC I',
  BarangayHealthServicesNCII = 'BARANGAY HEALTH SERVICES NC II',
  BartendingNCII = 'BARTENDING NC II',
  BreadAndPastryProductionNCII = 'BREAD AND PASTRY PRODUCTION NC II',
  BookkeepingNCII = 'BOOKKEEPING NC II',
  BookkeepingNCIII = 'BOOKKEEPING NC III',
  BookkeepingNCIIIMobileTrainingProgram = 'BOOKKEEPING NC III – MOBILE TRAINING PROGRAM',
  CaregivingNCII = 'CAREGIVING NC II',
  CarpentryNCII = 'CARPENTRY NC II',
  CommunityBasedTrainersMethodologyCourse = 'COMMUNITY-BASED TRAINERS METHODOLOGY COURSE',
  ComputerSystemsServicingNCII = 'COMPUTER SYSTEMS SERVICING NC II',
  ConsumerElectronicsServicingNCIII = 'CONSUMER ELECTRONICS SERVICING NC III',
  ConstructionPaintingNCII = 'CONTRUCTION PAINTING NC II',
  CookeryNCII = 'COOKERY NC II',
  DrivingNCII = 'DRIVING NC II',
  DrivingPassengerBusStraightTruckNCII = 'DRIVING (PASSENGER BUS/STRAIGHT TRUCK) NC II',
  EntrepreneurshipLevelIV = 'ENTREPRENEURSHIP LEVEL IV',
  ElectricalInstallationAndMaintenanceNCII = 'ELECTRICAL INSTALLATION AND MAINTENANCE NC II',
  ElectronicProductsAssemblyAndServicingNCII = 'ELECTRONIC PRODUCTS ASSEMBLY AND SERVICING NC II',
  EventsManagementServicesNCII = 'EVENTS MANAGEMENTS SERVICES NC II',
  FacilitateELearningSessions = 'FACILITATE E-LEARNING SESSIONS',
  FoodProcessingNCII = 'FOOD PROCCESSING NC II',
  FoodProcessingNCIIMobileTrainingPrograms = 'FOOD PROCCESSING NC II – MOBILE TRAINING PROGRAMS',
  GasTungstenArcWeldingNCII = 'GAS TUNGSTEN ARC WELDING NC II',
  HeavyEquipmentOperationRigidDumpTruckNCII = 'HEAVY EQUIPMENT OPERATRION (RIGID ON-HIGHWAY DUMP TRUCK) NC II',
  HeavyEquipmentOperationWheelLoaderNCII = 'HEAVY EQUIPMENT OPERATION (WHEEL LOADER) NC II',
  HilotWellnessMassageNCII = 'HILOT (WELLNESS MASSAGE) NC II',
  Housekeeping = 'HOUSEKEEPING',
  MasonryNCI = 'MASONRY NC I',
  MasonryNCII = 'MASONRY NC II',
  OrganicAgricultureProductionNCII = 'ORGANIC AGRICULTURE PRODUCTION NC II',
  PCSystemsInstallationNCII = 'PC SYSTEMS INSTALLATION NC II',
  PlumbingNCI = 'PLUMBING NC I',
  PlumbingNCII = 'PLUMBING NC II',
  HighQualityInbredRiceProductionAndCertification = 'PRODUCTION OF HIGH-QUALITY INBRED RICE, AND SEED CERTIFICATION, AND FARM',
  ProgrammingJavaNCII = 'PROGRAMMING (JAVA) NC II',
  RiceMachineryOperationsNCII = 'RICE MACHINERY OPERATIONS NC II',
  ShieldedMetalArcWeldingSMAWNCI = 'SHIELDED METAL ARC WELDING (SMAW) NC I',
  ShieldedMetalArcWeldingSMAWNCII = 'SHIELDED METAL ARC WELDING (SMAW) NC II',
  SolarPowerIrrigationSystemSPISOperationAndMaintenanceLevelII = 'SOLAR POWER IRRIGATION SYSTEM (SPIS) OPERATION AND MAINTENANCE LEVEL II',
  TileSettingNCII = 'TILE SETTING NC II',
  TourismPromotionServices = 'TOURISM PROMOTION SERVICES',
  TrainersMethodologyLevelITrainerAssessor = 'TRAINERS METHODOLOGY LEVEL I (TRAINER/ASSESSOR)',
  TrainersMethodologyLevelNCI = 'TRAINERS METHODOLOGY LEVEL NC I',
}
