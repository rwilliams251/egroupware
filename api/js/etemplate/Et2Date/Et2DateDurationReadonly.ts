/**
 * EGroupware eTemplate2 - Readonly duration WebComponent
 *
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 * @package api
 * @link https://www.egroupware.org
 * @author Nathan Gray
 */


import {css, html} from "@lion/core";
import {Et2DateDuration, formatOptions} from "./Et2DateDuration";
import {dateStyles} from "./DateStyles";


/**
 * This is a stripped-down read-only widget used in nextmatch
 */
export class Et2DateDurationReadonly extends Et2DateDuration
{
	static get styles()
	{
		return [
			...super.styles,
			...dateStyles,
			css`
			:host {
			border: none;
			min-width: 2em;
			}
			`
		];
	}

	constructor()
	{
		super();

		// Property defaults
		this.select_unit = false;	// otherwise just best matching unit will be used for eg. display_format "h:m:s"
	}

	get value()
	{
		return this.__value;
	}

	set value(_value)
	{
		this.__value = _value;
	}

	render()
	{
		let parsed = this.__value;

		const format_options = <formatOptions>{
			select_unit: this.select_unit,
			display_format: this.display_format,
			data_format: this.data_format,
			number_format: this.egw().preference("number_format"),
			hours_per_day: this.hours_per_day,
			empty_not_0: this.empty_not_0
		};

		const display = this.formatter(parsed, format_options);
		return html`
            <span ${this.id ? html`id="${this._dom_id}"` : ''}>
                  ${display.value}${display.unit}
            </span>
		`;
	}

	getDetachedAttributes(attrs)
	{
		attrs.push("id", "value", "class");
	}

	getDetachedNodes() : HTMLElement[]
	{
		return [<HTMLElement><unknown>this];
	}

	setDetachedAttributes(_nodes : HTMLElement[], _values : object, _data? : any) : void
	{
		// Do nothing, since we can't actually stop being a DOM node...
	}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-date-duration_ro", Et2DateDurationReadonly);