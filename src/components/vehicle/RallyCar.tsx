import { CarModel } from '../../game/CarModel'
import { CARS } from '../../store/gameStore'

export default function RallyCar() {
  return <CarModel spec={CARS[0]} />
}
