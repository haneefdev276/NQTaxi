import MapTracking from '@components/map/MapTracking'
import { ongoingRide } from '@data/mockData'

export default function LiveTrackingWidget() {
  return (
    <MapTracking
      route={ongoingRide.route}
      carPosition={ongoingRide.carPosition}
      driver={ongoingRide.driver}
      pickup={ongoingRide.pickup}
      drop={ongoingRide.drop}
      status={ongoingRide.status}
      height="280px"
    />
  )
}
