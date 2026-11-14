export interface State {
   isLoading: boolean;
   events: AdminWeb.Features.Game.AssignedEvent[];
   selectedEventId: string;
   selectedGameId: string;
}
