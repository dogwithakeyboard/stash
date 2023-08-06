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
  const { value } = criterion;

  const [match, initNumber1, initDatePart1] =
    regexRelativeDate(value.value) || [];

  const [, initNumber2, initDatePart2] = regexRelativeDate(value.value2) || [];

  const [number1, setNumber1] = useState(parseInt(initNumber1 ?? "0", 10));

  const [datePart1, setPart1] = useState(initDatePart1 ?? "days");

  const [number2, setNumber2] = useState(parseInt(initNumber2 ?? "0", 10));

  const [datePart2, setPart2] = useState(initDatePart2 ?? "days");

  const [dateFilterFixedOrRelative, setDateFilter] = useState(
    match ? "r" : "f"
  );

  function onChanged(newValue: string, property: "value" | "value2") {
    const valueCopy = { ...value };
    valueCopy[property] = newValue;
    onValueChanged(valueCopy);
  }

  function onNumberChanged(newNumber: number, property: "value" | "value2") {
    if (property === "value") {
      setNumber1(newNumber);
    } else {
      setNumber2(newNumber);
    }
    const valueCopy = { ...value };
    valueCopy[property] = makeValue(newNumber, null, property);
    onValueChanged(valueCopy);
  }

  function onPartChanged(newPart: string, property: "value" | "value2") {
    if (property === "value") {
      setPart1(newPart);
    } else {
      setPart2(newPart);
    }
    const valueCopy = { ...value };
    valueCopy[property] = makeValue(null, newPart, property);
    onValueChanged(valueCopy);
  }

  function makeValue(
    newNumber: number | null,
    newPart: string | null,
    property: "value" | "value2"
  ) {
    let valueString = "today";
    const number = newNumber ?? (property === "value" ? number1 : number2) ?? 0;
    const datePart =
      newPart ?? (property === "value" ? datePart1 : datePart2) ?? "days";

    if (number == 0) {
      return valueString;
    }
    valueString += " " + number;
    if (datePart) {
      valueString += " " + datePart;
    }
    return valueString;
  }

  function onChangedDateFilterSelect(o: "r" | "f") {
    setDateFilter(o);
    if (o === "r") {
      const valueCopy = { ...value };
      valueCopy.value = makeValue(null, null, "value");
      if (
        criterion.modifier === CriterionModifier.Between ||
        criterion.modifier === CriterionModifier.NotBetween
      ) {
        valueCopy.value2 = makeValue(null, null, "value2");
      } else {
        valueCopy.value2 = undefined;
      }
      onValueChanged(valueCopy);
    } else if (o === "f") {
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
    if (dateFilterFixedOrRelative === "f") {
      equalsControl = (
        <Form.Group>
          <DateInput
            value={value?.value ?? ""}
            onValueChange={(v) => onChanged(v, "value")}
            placeholder={intl.formatMessage({ id: "criterion.value" })}
          />
        </Form.Group>
      );
    } else if (dateFilterFixedOrRelative === "r") {
      equalsControl = (
        <>
          <Form.Group>
            <Form.Control
              className="btn-secondary"
              type="number"
              onChange={(e) =>
                onNumberChanged(parseInt(e.target.value, 10), "value")
              }
              defaultValue={number1}
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
    if (dateFilterFixedOrRelative === "f") {
      lowerControl = (
        <Form.Group>
          <DateInput
            value={value?.value ?? ""}
            onValueChange={(v) => onChanged(v, "value")}
            placeholder={intl.formatMessage({ id: "criterion.greater_than" })}
          />
        </Form.Group>
      );
    } else if (dateFilterFixedOrRelative === "r") {
      lowerControl = (
        <>
          <Form.Group>
            <Form.Control
              className="btn-secondary"
              type="number"
              onChange={(e) =>
                onNumberChanged(parseInt(e.target.value, 10), "value")
              }
              defaultValue={number1}
              placeholder={intl.formatMessage({ id: "criterion.greater_than" })}
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
    if (dateFilterFixedOrRelative === "f") {
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
    } else if (dateFilterFixedOrRelative === "r") {
      upperControl = (
        <>
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
          selected: dateFilterFixedOrRelative === "f",
        })}
        onClick={() => onChangedDateFilterSelect("f")}
      >
        {intl.formatMessage({ id: "fixed_date" })}
      </Button>
      <Button
        className={cx("modifier-option", {
          selected: dateFilterFixedOrRelative === "r",
        })}
        onClick={() => onChangedDateFilterSelect("r")}
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
