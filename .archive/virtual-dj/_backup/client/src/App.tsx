import { AutomixPanel } from './components/AutomixPanel';
import { LeftPanel } from './components/LeftPanel';
import { ShowProvider } from './state/ShowProvider';

export function App() {
   return (
      <ShowProvider>
         <div className="app">
            <LeftPanel />
            <AutomixPanel />
         </div>
      </ShowProvider>
   );
}
