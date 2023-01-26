import { useState } from "react";
import styles from "../styles/ChaptersPanel.module.scss"

export function ChaptersPanel(props: any) {
    const [selectedChapter, setSelectedChapter] = useState(0);

    return (
        <div className={styles.panel}>
            <div className={styles.chapterHeading}>
                Chapters
                <svg width="18" height="18" viewBox="0 0 18 21" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12.8109 2.75937C13.0663 2.54486 13.0918 2.15776 12.8405 1.93831C11.8151 1.04258 10.4736 0.5 9.00457 0.5C5.82168 0.5 3.23473 3.04831 3.17239 6.21626C3.17112 6.28068 3.119 6.33333 3.05457 6.33333H1.41668C1.09451 6.33333 0.833344 6.5945 0.833344 6.91667V19.75C0.833344 20.0722 1.09451 20.3333 1.41668 20.3333H16.5833C16.9055 20.3333 17.1667 20.0722 17.1667 19.75V6.91667C17.1667 6.5945 16.9055 6.33333 16.5833 6.33333H5.62123C5.5568 6.33333 5.50437 6.28084 5.50648 6.21645C5.56811 4.33716 7.11025 2.83333 9.00457 2.83333C9.38054 2.83333 9.74285 2.89258 10.0824 3.00195C10.4458 3.11977 10.7833 3.29535 11.0838 3.5178C11.3277 3.69839 11.6683 3.71879 11.9007 3.52361L12.8109 2.75937ZM3.16668 9.25C3.16668 8.92783 3.42784 8.66667 3.75001 8.66667H14.25C14.5722 8.66667 14.8333 8.92783 14.8333 9.25V17.4167C14.8333 17.7388 14.5722 18 14.25 18H3.75001C3.42784 18 3.16668 17.7388 3.16668 17.4167V9.25Z"/>
                </svg>
            </div>
            {props.chapters != null ? props.chapters.map((el, i) => {
                return (
                    <div className={`chapterItem ${selectedChapter == i ? "active" : ""}`} onClick={() => {
                        setSelectedChapter(i)
                    }}>
                        <h4 className={styles.chapterIndex}>{i + 1}</h4>
                        <div className={styles.chapterDetails}>
                            <h4 className={styles.chapterName}>{el.title}</h4>
                            <h4 className={styles.chapterLength}>{el.length}</h4>
                        </div>
                    </div>
                )
            } ) : ""}
        </div>
    );
}
