import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { WagmiConfig, createClient, configureChains } from "wagmi";
import { polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { provider, webSocketProvider } = configureChains([polygon], [publicProvider()]);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <WagmiConfig client={client}>
    <App />
  </WagmiConfig>
);