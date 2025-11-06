'use client'
import './BackLines.scss'

export default function BackLines() {
    return (
        <div className="background-lines">
            <div className="lines-row">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="line horizontal"></div>
                ))}
            </div>
            <div className="lines-column">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="line vertical"></div>
                ))}
            </div>
        </div>
    )
}
