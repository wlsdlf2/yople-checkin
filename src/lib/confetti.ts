import confetti from 'canvas-confetti'

export function triggerCelebrationConfetti() {
  confetti({ particleCount: 100, angle: 45, spread: 40, origin: { x: 0.1, y: 0.75 }, startVelocity: 45 })
  confetti({ particleCount: 100, angle: 135, spread: 40, origin: { x: 0.9, y: 0.75 }, startVelocity: 45 })
}
