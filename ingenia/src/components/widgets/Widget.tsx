"use client";
import type { Widget as WidgetSpec } from "@/engine/types";
import { CodeStepper } from "../code/CodeStepper";
import { FractionBarsWidget, NumberLineWidget, PercentWidget, PowerWidget, UnitsWidget } from "./Simple";
import { BalanceWidget, KinematicsWidget, PlotWidget, VectorWidget } from "./Interactive";
import { FunctionPointWidget, TangentWidget, TrigWidget } from "./Calculus";
import { BuoyancyWidget, ForcesWidget, MatrixWidget, MotionWidget, ParamFunctionWidget, ProjectileWidget, RiemannWidget, TangentSweepWidget, VectorComponentsWidget } from "./Animated";

/** Despacha la especificación de un widget (dato del contenido) a su componente. */
export function Widget({ widget }: { widget: WidgetSpec }) {
  switch (widget.type) {
    case "numberline":
      return <NumberLineWidget min={widget.min} max={widget.max} start={widget.start} />;
    case "fraction-bars":
      return <FractionBarsWidget a={widget.a} b={widget.b} c={widget.c} d={widget.d} />;
    case "balance":
      return <BalanceWidget equation={widget.equation} />;
    case "plot":
      return <PlotWidget mode={widget.mode} initial={widget.initial} />;
    case "vector":
      return <VectorWidget x={widget.x} y={widget.y} showSum={widget.showSum} />;
    case "kinematics":
      return <KinematicsWidget x0={widget.x0} v0={widget.v0} a={widget.a} />;
    case "code":
      return <CodeStepper code={widget.code} />;
    case "percent":
      return <PercentWidget base={widget.base} percent={widget.percent} />;
    case "power":
      return <PowerWidget base={widget.base} exponent={widget.exponent} />;
    case "units":
      return <UnitsWidget value={widget.value} />;
    case "trig":
      return <TrigWidget angle={widget.angle} hyp={widget.hyp} />;
    case "tangent":
      return <TangentWidget initial={widget.initial} />;
    case "function-point":
      return <FunctionPointWidget expr={widget.expr} />;
    case "motion":
      return <MotionWidget v0={widget.v0} a={widget.a} />;
    case "forces":
      return <ForcesWidget angle={widget.angle} mu={widget.mu} mass={widget.mass} />;
    case "projectile":
      return <ProjectileWidget v0={widget.v0} angle={widget.angle} h0={widget.h0} />;
    case "buoyancy":
      return <BuoyancyWidget body={widget.body} liquid={widget.liquid} />;
    case "vector-components":
      return <VectorComponentsWidget mag={widget.mag} angle={widget.angle} />;
    case "tangent-sweep":
      return <TangentSweepWidget expr={widget.expr} />;
    case "riemann":
      return <RiemannWidget expr={widget.expr} a={widget.a} b={widget.b} />;
    case "param-function":
      return <ParamFunctionWidget family={widget.family} />;
    case "matrix":
      return <MatrixWidget a={widget.a} b={widget.b} c={widget.c} d={widget.d} />;
  }
}
