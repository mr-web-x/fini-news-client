'use client'
import './BackLines.scss'

export default function BackLines() {
    const rowClasses = ['background__line-75-row', 'background__line-50-row', 'background__line-full-row'];
    const columnClasses = ['background__line-75-column', 'background__line-50-column', 'background__line-full-column'];

    return (
        <div className="background__lines desktop-lines">
            <div className="background__lines-wrapper background__lines-row">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={`row-${i}`}
                        className={`background__line ${rowClasses[i % 3]}`}
                    ></div>
                ))}
            </div>
            <div className="background__lines-wrapper background__lines-column">
                {Array.from({ length: 15 }).map((_, i) => (
                    <div
                        key={`col-${i}`}
                        className={`background__line ${columnClasses[i % 3]}`}
                    ></div>
                ))}
            </div>
        </div>
    )
}