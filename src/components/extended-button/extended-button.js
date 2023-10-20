import settings from "../../globals/settings.js";
import CDSButton from "@carbon/web-components/es/components/button/button";
import styles from "./extended-button.scss?inline";

const { stablePrefix: c4aiPrefix } = settings;

/**
 * Component extending the @carbon/web-components' button
 */
export class C4AIExtendedButton extends CDSButton {
  static styles = styles;
}

customElements.define(`${c4aiPrefix}-extended-button`, C4AIExtendedButton);
