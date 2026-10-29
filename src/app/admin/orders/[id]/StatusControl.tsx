"use client";

import { useOptimistic, useTransition } from "react";
import { Icon, cx } from "@/components/ui";
import type { OrderStatus } from "@/db/models";
import { setOrderStatus } from "../../actions";
import { STATUS_LABEL } from "../../format";
import s from "../../admin.module.css";

const STEPS: OrderStatus[] = ["preparing", "ready", "completed"];

/** The order's steps in sequence; tapping one moves the order there (forward or back). */
export function StatusControl({ id, status }: { id: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const [shown, setShown] = useOptimistic(status);
  const at = STEPS.indexOf(shown);

  return (
    <ol className={cx(s.steps, pending && s.busy)} aria-label="Order status">
      {STEPS.map((step, i) => (
        <li key={step}>
          <button
            type="button"
            className={cx(s.step, i <= at && s.stepDone, i === at && s.stepCurrent)}
            aria-current={i === at ? "step" : undefined}
            disabled={pending || i === at}
            onClick={() =>
              start(async () => {
                setShown(step);
                await setOrderStatus(id, step);
              })
            }
          >
            <span className={s.stepDot}>{i < at ? <Icon name="check" size={14} strokeWidth={2.6} /> : i + 1}</span>
            {STATUS_LABEL[step]}
          </button>
        </li>
      ))}
    </ol>
  );
}
