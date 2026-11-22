export interface Version_Payload {
   version?: string;
   buildId?: string;
}

export interface State {
   serverVersion: string;
   serverBuildId: string;
   isChecking: boolean;
}
