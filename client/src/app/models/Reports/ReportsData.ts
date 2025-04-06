export interface ReportData {
    fullName: string;
    gender: string;
    height: number;
    dateOfBirth: Date;
    metrics: Metrics[];
    appointments: Appointment[];
}

export interface Metrics {
    id: string;
    bodyweight: number;
    fatMass: number;
    muscleMass: number;
    dateCreated: Date;
    userId: string;
}

export interface Appointment {
    id: string;
    date: Date;
    description: string;
    userId: string;
}