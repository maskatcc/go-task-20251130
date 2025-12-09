import readline from "node:readline";

export class ProgressBar {
  _currentProgress: number
  _barLength: number
  _description: string
  _progressChar: string

  constructor(description: string, progressChar: string = '>') {
    this._currentProgress = 0
    this._barLength = 25
    this._description = description

    if (progressChar.length !== 1)
      throw new Error('progressChar must be a single character')

    this._progressChar = progressChar
  }

  update(current: number | undefined, total: number | undefined) {
    this._currentProgress = (current && total) ? current / total : 0;
    this._render();
  }

  _render() {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);

    const filledLength = Math.round(this._barLength * this._currentProgress)
    const bar = this._progressChar.repeat(filledLength) + ' '.repeat(this._barLength - filledLength)

    process.stdout.write(
      `${this._description} [${bar}] ${this._currentProgress * 100}%`,
    )

    if (this._currentProgress === 1) {
      process.stdout.write('\n')
    }
  }
}
