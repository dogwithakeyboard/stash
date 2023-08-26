import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useIntl } from "react-intl";
import { CriterionModifier } from "../../../core/generated-graphql";
import { IDateValue } from "../../../models/list-filter/types";
import { Criterion } from "../../../models/list-filter/criteria/criterion";
import { DateInput } from "src/components/Shared/DateInput";
import { regexRelativeDate } from "src/utils/relativeDate";
import cx from "classnames";

interface IDateFilterProps {
  criterion: Criterion<IDateValue>;
  onValueChanged: (value: IDateValue) => void;
}

export const DateFilter: React.FC<IDateFilterProps> = ({
  criterion,
  onValueChanged,
}) => {
  const intl = useIntl();

  const dateParts = new Map([
    [intl.formatMessage({ id: "days" }), "days"],
    [intl.formatMessage({ id: "months" }), "months"],
    [intl.formatMessage({ id: "years" }), "years"],
  ]);

  const dateDirection = new Map([
    [intl.formatMessage({ id: "past" }), "-"],
    [intl.formatMessage({ id: "future" }), "+"],
  ]);
  
  const { value } = criterion;

  const [match, initNumber1, initDatePart1] =
    regexRelativeDate(value.value) || [];

  const [, initNumber2, initDatePart2] = regexRelativeDate(value.value2) || [];

  const numberInt1 = parseInt(initNumber1, 10);
  const numberInt2 = parseInt(initNumber2, 10);

  const [number1, setNumber1] = useState(isNaN(numberInt1) ? 0 : Math.abs(numberInt1));
  const [datePart1, setPart1] = useState(initDatePart1 ?? "days");
  const [direction1, setDirection1] = useState(numberInt1 > 0 ? "+" : "-" )

  const [number2, setNumber2] = useState(isNaN(numberInt2) ? 0 : Math.abs(numberInt2));
  const [datePart2, setPart2] = useState(initDatePart2 ?? "days");
  const [direction2, setDirection2] = useState(numberInt2 > 0 ? "+" : "-" )

  const [dateFilterRelative, setDateFilter] = useState(
    match ? true : false
  );

  function onChanged(newValue: string, property: "value" | "value2") {
    const valueCopy = { ...value };
    valueCopy[property] = newValue;
    onValueChanged(valueCopy);
  }

  function onNumberChanged(newValue: number, property: "value" | "value2") {
    if (property === "value") {
      setNumber1(newValue);
    } else {
      setNumber2(newValue);
    }
    const valueCopy = { ...value };
    valueCopy[property] = makeValue(newValue, null, null, property);
    onValueChanged(valueCopy);
  }

  function onDirectionChanged(newValue: string, property: "value" | "value2") {
    if (property === "value") {
      setDirection1(newValue);
    } else {
      setDirection2(newValue);
    }
    const valueCopy = { ...value };
    valueCopy[property] = makeValue(null, null, newValue, property);
    onValueChanged(valueCopy);
  }

  function onPartChanged(newPart: string, property: "value" | "value2") {
    if (property === "value") {
      setPart1(newPart);
    } else {
      setPart2(newPart);
    }
    const valueCopy = { ...value };
    valueCopy[property] = makeValue(null, newPart, null, property);
    onValueChanged(valueCopy);
  }

  function makeValue(
    newNumber: number | null,
    newPart: string | null,
    newDirection: string | null,
    property: "value" | "value2"
  ) {
    let valueString = "today";
    const number = newNumber ?? (property === "value" ? number1 : number2) ?? 0;
    const datePart =
      newPart ?? (property === "value" ? datePart1 : datePart2) ?? "days";
    const direction = newDirection ?? (property === "value" ? direction1 : direction2) ?? "-";

    if (number === 0) {
      return valueString;
    }
    valueString += ","
    if (direction === "-" && number > 0){
      valueString += "-"
    }
    valueString += number + "," + datePart;
    return valueString;
  }

  function onChangedDateFilterSelect(o: boolean) {
    setDateFilter(o);
    if (o === true) {
      const valueCopy = { ...value };
      valueCopy.value = makeValue(null, null, null, "value");
      if (
        criterion.modifier === CriterionModifier.Between ||
        criterion.modifier === CriterionModifier.NotBetween
      ) {
        valueCopy.value2 = makeValue(null, null, null, "value2");
      } else {
        valueCopy.value2 = undefined;
      }
      onValueChanged(valueCopy);
    } else if (o === false) {
      const valueCopy = { ...value };
      valueCopy.value = "";
      valueCopy.value2 = undefined;
      onValueChanged(valueCopy);
    }
  }

  let equalsControl: JSX.Element | null = null;
  if (
    criterion.modifier === CriterionModifier.Equals ||
    criterion.modifier === CriterionModifier.NotEquals
  ) {
    if (dateFilterRelative === false) {
      equalsControl = (
        <Form.Group>
          <DateInput
            value={value?.value ?? ""}
            onValueChange={(v) => onChanged(v, "value")}
            placeholder={intl.formatMessage({ id: "criterion.value" })}
          />
        </Form.Group>
      );
    } else if (dateFilterRelative === true) {
      equalsControl = (
        <>
          <Form.Group>
            <Form.Control
              as="select"
              className="btn-secondary"
              type="option"
              onChange={(e) => onDirectionChanged(e.target.value, "value")}
              defaultValue={direction1}
            >
              {Array.from(dateDirection.entries()).map(([name, optionValue]) => (
                <option value={optionValue} key={optionValue}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Control
              className="btn-secondary"
              type="number"
              onChange={(e) =>
                onNumberChanged(parseInt(e.target.value, 10), "value")
              }
              defaultValue={number1}
              min={0}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="select"
              className="btn-secondary"
              type="option"
              onChange={(e) => onPartChanged(e.target.value, "value")}
              defaultValue={datePart1}
            >
              {Array.from(dateParts.entries()).map(([name, optionValue]) => (
                <option value={optionValue} key={optionValue}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </>
      );
    }
  }

  let lowerControl: JSX.Element | null = null;
  if (
    criterion.modifier === CriterionModifier.GreaterThan ||
    criterion.modifier === CriterionModifier.Between ||
    criterion.modifier === CriterionModifier.NotBetween
  ) {
    if (dateFilterRelative === false) {
      lowerControl = (
        <Form.Group>
          <DateInput
            value={value?.value ?? ""}
            onValueChange={(v) => onChanged(v, "value")}
            placeholder={intl.formatMessage({ id: "criterion.greater_than" })}
          />
        </Form.Group>
      );
    } else if (dateFilterRelative === true) {
      lowerControl = (
        <>
        <Form.Group>
        <Form.Control
          as="select"
          className="btn-secondary"
          type="option"
          onChange={(e) => onDirectionChanged(e.target.value, "value")}
          defaultValue={direction1}
        >
          {Array.from(dateDirection.entries()).map(([name, optionValue]) => (
            <option value={optionValue} key={optionValue}>
              {name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
          <Form.Group>
            <Form.Control
              className="btn-secondary"
              type="number"
              onChange={(e) =>
                onNumberChanged(parseInt(e.target.value, 10), "value")
              }
              defaultValue={number1}
              min={0}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="select"
              className="btn-secondary"
              type="option"
              onChange={(e) => onPartChanged(e.target.value, "value")}
              defaultValue={datePart1}
            >
              {Array.from(dateParts.entries()).map(([name, optionValue]) => (
                <option value={optionValue} key={optionValue}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </>
      );
    }
  }

  let upperControl: JSX.Element | null = null;
  if (
    criterion.modifier === CriterionModifier.LessThan ||
    criterion.modifier === CriterionModifier.Between ||
    criterion.modifier === CriterionModifier.NotBetween
  ) {
    if (dateFilterRelative === false) {
      upperControl = (
        <Form.Group>
          <DateInput
            value={
              (criterion.modifier === CriterionModifier.LessThan
                ? value?.value
                : value?.value2) ?? ""
            }
            onValueChange={(v) =>
              onChanged(
                v,
                criterion.modifier === CriterionModifier.LessThan
                  ? "value"
                  : "value2"
              )
            }
            placeholder={intl.formatMessage({ id: "criterion.less_than" })}
          />
        </Form.Group>
      );
    } else if (dateFilterRelative === true) {
      upperControl = (
        <>
        <Form.Group>
        <Form.Control
          as="select"
          className="btn-secondary"
          type="option"
          onChange={(e) =>
            onDirectionChanged(
              e.target.value,
              criterion.modifier === CriterionModifier.LessThan
                ? "value"
                : "value2"
            )
          }
          defaultValue={criterion.modifier === CriterionModifier.LessThan ? direction1 : direction2 }
        >
          {Array.from(dateDirection.entries()).map(([name, optionValue]) => (
            <option value={optionValue} key={optionValue}>
              {name}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
          <Form.Group>
            <Form.Control
              className="btn-secondary"
              type="number"
              onChange={(e) =>
                onNumberChanged(
                  parseInt(e.target.value, 10),
                  criterion.modifier === CriterionModifier.LessThan
                    ? "value"
                    : "value2"
                )
              }
              defaultValue={
                criterion.modifier === CriterionModifier.LessThan
                  ? number1
                  : number2
              }
              min={0}
            />
          </Form.Group>
          <Form.Group>
            <Form.Control
              as="select"
              className="btn-secondary"
              type="option"
              onChange={(e) =>
                onPartChanged(
                  e.target.value,
                  criterion.modifier === CriterionModifier.LessThan
                    ? "value"
                    : "value2"
                )
              }
              defaultValue={
                criterion.modifier === CriterionModifier.LessThan
                  ? datePart1
                  : datePart2
              }
            >
              {Array.from(dateParts.entries()).map(([name, optionValue]) => (
                <option value={optionValue} key={optionValue}>
                  {name}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </>
      );
    }
  }

  const relativeFixedControl = (
    <Form.Group className="modifier-options btn-group">
      <Button
        className={cx("modifier-option", {
          selected: dateFilterRelative === false,
        })}
        onClick={() => onChangedDateFilterSelect(false)}
      >
        {intl.formatMessage({ id: "fixed_date" })}
      </Button>
      <Button
        className={cx("modifier-option", {
          selected: dateFilterRelative === true,
        })}
        onClick={() => onChangedDateFilterSelect(true)}
      >
        {intl.formatMessage({ id: "relative_date" })}
      </Button>
    </Form.Group>
  );

  return (
    <>
      {relativeFixedControl}
      {equalsControl}
      {lowerControl}
      {upperControl}
    </>
  );
};
