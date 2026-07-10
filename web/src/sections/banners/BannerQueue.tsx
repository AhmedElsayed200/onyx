"use client";

// Bottom-left floating banner: shows one banner-worthy notification at a time
// (admin site-wide announcement, license expiry warning, trial-ending notice),
// pageable via prev/next when more than one is active. Always dismissible.
// Floats over the sidebar's bottom corner, like the user-center menus.

import { usePathname } from "next/navigation";
import { Button, Text } from "@opal/components";
import { cn, markdown } from "@opal/utils";
import { timeAgo } from "@opal/time";
import { SvgChevronLeft, SvgChevronRight, SvgX } from "@opal/icons";
import { isAuthPath } from "@/lib/auth/paths";
import { getNotificationIcon } from "@/lib/notifications";
import {
  NotificationType,
  type Notification,
} from "@/lib/notifications/interfaces";
import {
  LICENSE_EXPIRY_ERROR_THRESHOLD,
  licenseExpirySeverity,
  useBannerQueue,
} from "@/lib/banner/hooks";

type BannerVariant = "info" | "warning" | "error";

const VARIANT_STYLES: Record<
  BannerVariant,
  { headerBg: string; iconClass: string }
> = {
  info: { headerBg: "bg-status-info-00", iconClass: "stroke-status-info-05" },
  warning: {
    headerBg: "bg-status-warning-00",
    iconClass: "stroke-status-warning-05",
  },
  error: {
    headerBg: "bg-status-error-00",
    iconClass: "stroke-status-error-05",
  },
};

function bannerVariant(notification: Notification): BannerVariant {
  switch (notification.notif_type) {
    case NotificationType.TRIAL_ENDS_TWO_DAYS:
      return "warning";
    case NotificationType.LICENSE_EXPIRY_WARNING:
      return licenseExpirySeverity(notification) >=
        LICENSE_EXPIRY_ERROR_THRESHOLD
        ? "error"
        : "warning";
    default:
      return "info";
  }
}

function bannerSourceLabel(notifType: NotificationType): string {
  switch (notifType) {
    case NotificationType.SYSTEM_ANNOUNCEMENT:
      return "Admin announcement";
    case NotificationType.LICENSE_EXPIRY_WARNING:
      return "License";
    case NotificationType.TRIAL_ENDS_TWO_DAYS:
      return "Trial";
    default:
      return "Notification";
  }
}

export default function BannerQueue() {
  const pathname = usePathname();
  const { current, hasMultiple, goToNext, goToPrevious, dismissCurrent } =
    useBannerQueue();

  if (isAuthPath(pathname) || !current) return null;

  const styles = VARIANT_STYLES[bannerVariant(current)];
  const Icon = getNotificationIcon(current.notif_type);
  const relativeTime = timeAgo(current.last_shown);
  const footer = relativeTime
    ? `${bannerSourceLabel(current.notif_type)} • ${relativeTime}`
    : bannerSourceLabel(current.notif_type);

  return (
    <div className="fixed bottom-2 left-2 z-toast w-[400px] max-w-[calc(100vw-1rem)]">
      <div className="flex flex-col gap-1 p-1 rounded-12 border border-border-01 bg-background-neutral-00 shadow-box">
        <div
          className={cn(
            "flex items-center gap-1 p-1.5 rounded-08",
            styles.headerBg
          )}
        >
          <Icon className={cn("h-5 w-5 shrink-0 p-0.5", styles.iconClass)} />
          <div className="flex-1 min-w-0 truncate px-0.5">
            <Text font="main-ui-action" color="text-04">
              {current.title}
            </Text>
          </div>
          {hasMultiple && (
            <>
              <Button
                icon={SvgChevronLeft}
                prominence="internal"
                size="sm"
                onClick={goToPrevious}
                aria-label="Previous banner"
              />
              <Button
                icon={SvgChevronRight}
                prominence="internal"
                size="sm"
                onClick={goToNext}
                aria-label="Next banner"
              />
            </>
          )}
          <Button
            icon={SvgX}
            prominence="internal"
            size="sm"
            onClick={() => void dismissCurrent()}
            aria-label="Dismiss"
          />
        </div>

        <div className="flex flex-col gap-1 p-2 rounded-08 bg-background-tint-01">
          {current.description && (
            <Text font="main-ui-body" color="text-03">
              {markdown(current.description)}
            </Text>
          )}
          <Text font="secondary-body" color="text-03">
            {footer}
          </Text>
        </div>
      </div>
    </div>
  );
}
