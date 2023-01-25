import { useState } from "react";

export function CaptionButton() {
    const [open, setOpen] = useState(true);

    return (
        <div
            aria-label="Settings"
            onClick={() => {
                open ? setOpen(false) : setOpen(true);
            }}
            className="media-caption-button"
        >
            <svg
                className="media-caption-icon"
                width="32"
                height="23"
                viewBox="0 0 32 23"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    display: open ? "none" : "block",
                    transition: "0.3s all ease",
                }}
            >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 2C0 0.89543 0.895431 0 2 0H30C31.1046 0 32 0.895431 32 2V21C32 22.1046 31.1046 23 30 23H2C0.895431 23 0 22.1046 0 21V2ZM6 5H14V8H9V15H14V18H6V5ZM26 5H18V18H26V15H21V8H26V5Z"
                    fill="white"
                />
            </svg>
            <svg
                className="media-caption-icon"
                width="32"
                height="26"
                viewBox="0 0 32 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    display: open ? "block" : "none",
                    transition: "0.3s all ease",
                }}
            >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0 2C0 0.89543 0.895431 0 2 0H30C31.1046 0 32 0.895431 32 2V21C32 22.1046 31.1046 23 30 23H2C0.895431 23 0 22.1046 0 21V2ZM6 5H14V8H9V15H14V18H6V5ZM26 5H18V18H26V15H21V8H26V5Z"
                    fill="white"
                />
                <rect
                    x="4"
                    y="25"
                    width="24"
                    height="2"
                    rx="1"
                    fill="white"
                />
            </svg>
        </div>
    );
}
