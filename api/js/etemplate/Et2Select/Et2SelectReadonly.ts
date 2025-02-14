/**
 * EGroupware eTemplate2 - Readonly select WebComponent
 *
 * @license http://opensource.org/licenses/gpl-license.php GPL - GNU General Public License
 * @package api
 * @link https://www.egroupware.org
 * @author Nathan Gray
 */


import {css, html, LitElement, repeat, TemplateResult} from "@lion/core";
import {et2_IDetachedDOM} from "../et2_core_interfaces";
import {Et2Widget} from "../Et2Widget/Et2Widget";
import {StaticOptions} from "./StaticOptions";
import {find_select_options, SelectOption} from "./FindSelectOptions";

const so = new StaticOptions();

/**
 * This is a stripped-down read-only widget used in nextmatch
 * (and other read-only usages)
 */
export class Et2SelectReadonly extends Et2Widget(LitElement) implements et2_IDetachedDOM
{
	static get styles()
	{
		return [
			...super.styles,
			css`
ul {
    margin: 0px;
    padding: 0px;
    display: inline-block;
}

li {
    text-decoration: none;
    list-style-image: none;
    list-style-type: none;
}
			`
		];
	}

	static get properties()
	{
		return {
			...super.properties,
			value: String,
			select_options: Array
		}
	}

	constructor()
	{
		super();
		this.type = "";
		this.select_options = [];
	}

	protected find_select_options(_attrs)
	{
		let sel_options = find_select_options(this, _attrs['select_options']);
		if(sel_options.length > 0)
		{
			this.set_select_options(sel_options);
		}
	}

	transformAttributes(_attrs)
	{
		/*
		TODO: Check with more / different nextmatch data to see if this becomes faster.
		Currently it's faster for the nextmatch to re-do transformAttributes() and find_select_options()
		 on every row than it is to use widget.clone()

		// If there's no parent, there's a good chance we're in a nextmatch row so skip the transform
		if(!this.getParent())
		{
			return;
		}
		 */

		super.transformAttributes(_attrs);

		this.find_select_options(_attrs)
	}

	set_value(value)
	{
		this.value = value;
	}

	set value(new_value)
	{
		// Split anything that is still a CSV
		if(typeof new_value == "string" && new_value.indexOf(",") > 0)
		{
			new_value = new_value.split(",");
		}
		// Wrap any single value into an array for consistent rendering
		if(typeof new_value == "string" || typeof new_value == "number")
		{
			new_value = ["" + new_value];
		}

		super.value = new_value;
	}

	get value()
	{
		return super.value;
	}

	/**
	 * Set the select options
	 *
	 * @param {SelectOption[]} new_options
	 */
	set_select_options(new_options : SelectOption[] | { [key : string] : string })
	{
		if(!Array.isArray(new_options))
		{
			let fixed_options : SelectOption[] = [];
			for(let key in new_options)
			{
				fixed_options.push(<SelectOption>{value: key, label: new_options[key]});
			}
			console.warn(this.id + " passed a key => value map instead of array");
			this.select_options = fixed_options;
			return;
		}
		this.select_options = new_options;
	}

	render()
	{
		if(!this.value)
		{
			return this._readonlyRender({label: this.empty_label, value: ""});
		}

		return html`
            <ul>
                ${repeat(this.value, (val : string) => val, (val) =>
                {
                    let option = this.select_options.find(option => option.value == val);
                    if(!option)
                    {
                        return "";
                    }
                    return this._readonlyRender(option);
                })}
            </ul>
		`;
	}

	_readonlyRender(option : SelectOption) : TemplateResult
	{
		return html`
            <li>${option.label}</li>
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

	loadFromXML()
	{
		// nope
	}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select_ro", Et2SelectReadonly);

export class Et2SelectAccountReadonly extends Et2SelectReadonly
{
	set value(new_value)
	{
		if(!new_value)
		{
			super.value = new_value;
			return;
		}
		// fix scalar (number or string) values
		if (typeof new_value !== 'object')
		{
			new_value = [new_value];
		}
		for(let id of new_value)
		{
			let account_name = null;
			let option = <SelectOption>{value: id, label: id + " ..."};
			this.select_options.push(option);
			if(new_value && (account_name = this.egw().link_title('api-accounts', id)))
			{
				option.label = account_name;
			}
			else if(!account_name)
			{
				// Not already cached, need to fetch it
				this.egw().link_title('api-accounts', id, function(title)
				{
					this.option.label = title;
					this.select.requestUpdate();
				}, {select: this, option: option});
			}
		}
		super.value = new_value;
	}

	get value()
	{
		return super.value;
	}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-account_ro", Et2SelectAccountReadonly);

export class Et2SelectAppReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.app(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-app_ro", Et2SelectAppReadonly);

export class Et2SelectBitwiseReadonly extends Et2SelectReadonly
{
	render()
	{
		let new_value = [];
		for(let index in this.select_options)
		{
			let option = this.select_options[index];
			let right = parseInt(option && option.value ? option.value : index);
			if(!!(this.value & right))
			{
				new_value.push(right);
			}
		}
		return html`
            <ul>
                ${repeat(new_value, (val : string) => val, (val) =>
                {
                    let option = this.select_options.find(option => option.value == val);
                    if(!option)
                    {
                        return "";
                    }
                    return this._readonlyRender(option);
                })}
            </ul>`;
	}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-bitwise_ro", Et2SelectBitwiseReadonly);

export class Et2SelectBoolReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();
		this.select_options = so.bool(this);
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-bool_ro", Et2SelectBoolReadonly);

export class Et2SelectCategoryReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.cat(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-cat_ro", Et2SelectCategoryReadonly);

export class Et2SelectPercentReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();
		this.select_options = so.percent(this, {});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-percent_ro", Et2SelectPercentReadonly);

export class Et2SelectCountryReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();
		this.select_options = so.country(this, {});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-country_ro", Et2SelectCountryReadonly);

export class Et2SelectDayReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.day(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-day_ro", Et2SelectDayReadonly);

export class Et2SelectDayOfWeekReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.dow(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-dow_ro", Et2SelectDayOfWeekReadonly);

export class Et2SelectHourReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.hour(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-hour_ro", Et2SelectHourReadonly);

export class Et2SelectMonthReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.month(this);
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-month_ro", Et2SelectMonthReadonly);

export class Et2SelectNumberReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.number(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-number_ro", Et2SelectNumberReadonly);

export class Et2SelectPriorityReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();
		this.select_options = so.priority(this);
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-priority_ro", Et2SelectPriorityReadonly);

export class Et2SelectStateReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.state(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-state_ro", Et2SelectStateReadonly);

export class Et2SelectTimezoneReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.timezone(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-timezone_ro", Et2SelectTimezoneReadonly);

export class Et2SelectYearReadonly extends Et2SelectReadonly
{
	constructor()
	{
		super();

		this.select_options = so.year(this, {other: this.other || []});
	}

	protected find_select_options(_attrs) {}
}

// @ts-ignore TypeScript is not recognizing that this widget is a LitElement
customElements.define("et2-select-year_ro", Et2SelectYearReadonly);