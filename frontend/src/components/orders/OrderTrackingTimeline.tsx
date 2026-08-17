import React from 'react';
import { OrderWorkflowState } from '../../types';
import { CheckCircle2, Circle, Clock, Truck, PlayCircle, CheckCheck, UserCheck } from 'lucide-react';

interface OrderTrackingTimelineProps {
  workflowState: OrderWorkflowState;
  startTime?: string | null;
  finishTime?: string | null;
}

interface TimelineStep {
  key: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  workflowState,
  startTime,
  finishTime,
}) => {
  const steps: TimelineStep[] = [
    {
      key: 'confirmed',
      title: 'Booking Confirmed',
      desc: 'Order placed & scheduled in the system.',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      key: 'assigned',
      title: 'Worker Assigned',
      desc: 'A verified professional has been assigned.',
      icon: <UserCheck className="w-5 h-5" />,
    },
    {
      key: 'on_the_way',
      title: 'On The Way',
      desc: 'Expert is travelling to your doorstep.',
      icon: <Truck className="w-5 h-5" />,
    },
    {
      key: 'started',
      title: 'Service Started',
      desc: startTime ? `Started at ${startTime}` : 'Work in progress at your premises.',
      icon: <PlayCircle className="w-5 h-5" />,
    },
    {
      key: 'completed',
      title: 'Service Completed',
      desc: finishTime ? `Finished at ${finishTime}` : 'Job completed and payment verified.',
      icon: <CheckCheck className="w-5 h-5" />,
    },
    {
      key: 'customer_confirmed',
      title: 'Customer Confirmed',
      desc: 'Service verified and approved by customer.',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
  ];

  const stateOrderMap: Record<OrderWorkflowState, number> = {
    'Draft': 0,
    'Payment Pending': 0,
    'Confirmed': 1,
    'Assigned': 2,
    'On The Way': 3,
    'Started': 4,
    'Completed': 5,
    'Customer Confirmed': 6,
    'Cancelled': -1,
  };

  const currentLevel = stateOrderMap[workflowState] || 0;

  if (workflowState === 'Cancelled') {
    return (
      <div className="bg-red-50 p-5 rounded-2xl border border-red-200 text-red-800 text-sm">
        <strong className="block font-bold mb-1">This booking has been cancelled.</strong>
        Please contact support if you need further assistance or want to re-book.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900">
          Service Progress
        </h3>
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
          Live Tracking
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isDone = currentLevel >= stepNumber;
          const isCurrent = currentLevel === stepNumber;

          return (
            <div key={step.key} className="relative flex items-start gap-4 group">
              {/* Dot Icon */}
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                    : 'bg-slate-200 text-slate-400 ring-4 ring-slate-50'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Text */}
              <div className="space-y-0.5">
                <h4
                  className={`text-sm font-bold leading-tight ${
                    isDone
                      ? 'text-teal-900'
                      : isCurrent
                      ? 'text-amber-900 font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
