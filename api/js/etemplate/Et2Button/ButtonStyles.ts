/**
 * Sharable button styles constant
 */

import {css} from "@lion/core";
import {colorsDefStyles} from "../Styles/colorsDefStyles";

export const buttonStyles = [
	colorsDefStyles,
	css`
	:host {
		border: 1px solid gray;
		color: var(--gray_70, #505050);
		background-color: var(--gray_10, #e6e6e6);
		border-radius: 3px;
	}
	:host(:hover) {
		box-shadow: 1px 1px 1px rgb(0 0 0 / 60%);
		background-color: var(--bg_color_15_gray, #d9d9d9);
	}
	:host(:active) {
		box-shadow: inset 1px 2px 1px rgb(0 0 0 / 50%);
	}
	div {
		margin: 2px;
		height:20px;
		font-size: 9pt;
		color: var(--btn-label-color);
		text-shadow: 0 0;
	}
`];