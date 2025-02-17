"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./editor.css";
import axios from "@/app/lib/axios";
import { isAxiosError } from "axios";
import QuillImageDropAndPaste, { ImageData } from "quill-image-drop-and-paste";
import CustomImageBlot from "./CustomImageBlot";

class NoopClass {}
const formats = [
    "font",
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "align",
    "image",
    "color",
    "background",
    "size",
    "customImage",
];

const fontSizeArr = [
    "8px",
    "9px",
    "10px",
    "12px",
    "15px",
    "16px",
    "20px",
    "24px",
    "32px",
    "42px",
    "54px",
    "68px",
    "84px",
    "98px",
];

const colorOptions = [
    "#000000",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b966",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
    "#b2b200",
    "#006100",
    "#0047b2",
    "#6b24b2",
    "#444444",
    "#5c0000",
    "#663d00",
    "#666600",
    "#003700",
    "#002966",
    "#3d1466",
];

export default function MyEditor({
    editorRef,
    initialValue,
    setContent,
    setLoading,
}: {
    editorRef: React.RefObject<any>;
    initialValue: string;
    setContent: (e: string) => void;
    setLoading: (e: boolean) => void;
}) {
    const [content, setLocalContent] = useState(initialValue);
    var Size: any = Quill.import("attributors/style/size");
    Size.whitelist = fontSizeArr;
    Quill.register(Size, true);
    Quill.register(
        {
            "modules/uploader": NoopClass,
        },
        false
    );
    Quill.register("customImage", CustomImageBlot);
    Quill.register("modules/imageDropAndPaste", QuillImageDropAndPaste);
    useEffect(() => {
        const toolbar: any = editorRef.current
            ?.getEditor()
            .getModule("toolbar");
        const sizeButton = toolbar.container.querySelector(
            ".ql-size > .ql-picker-label"
        );
        sizeButton.innerHTML = `<svg class="fr-svg" focusable="false" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.75,19h1.5l-3-10h-1.5l-3,10h1.5L17,16.5h3Zm-3.3-4,1.05-3.5L19.55,15Zm-5.7,4h2l-5-14h-2l-5,14h2l1.43-4h5.14ZM5.89,13,7.75,7.8,9.61,13Z"></path></svg>`;
    }, [editorRef]);

    useEffect(() => {
        setContent(content);
    }, [content, setContent]);

    async function imagePasteHandler(
        imageDataUrl: string,
        type: string,
        imageData: ImageData
    ) {
        setLoading(true);
        const editor = editorRef.current?.getEditor()!;
        const range = editor?.getSelection(true);
        try {
            const { data } = await axios.post(
                `/api/upload`,
                {
                    file: imageData.toBlob(),
                },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const files: { url: string; width: number; height: number }[] =
                data.files;

            files.forEach(({ url, width, height }, index) => {
                editor.insertEmbed(range.index + index, "customImage", {
                    url: url,
                    width: width,
                    height: height,
                    loading: "lazy",
                    decoding: "async",
                });
            });
            editor.setSelection(range.index + files.length + 1);
        } catch (error) {
            if (isAxiosError(error) && error.response) {
                alert(error.response.data.message);
            }
            console.log(error);
        }
        setLoading(false);
    }

    const imageHandler = async () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("multiple", "");
        input.setAttribute("accept", "image/*");
        input.click();
        input.addEventListener("change", async () => {
            setLoading(true);
            if (input.files === undefined || input.files?.length == 0) return;
            const editor = editorRef.current?.getEditor()!;

            const file = input.files;
            if (file?.length == 0) return;

            const range = editor?.getSelection(true);
            try {
                const { data } = await axios.post(
                    `/api/upload`,
                    {
                        file: file,
                    },
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                const files: { url: string; width: number; height: number }[] =
                    data.files;

                files.forEach(({ url, width, height }, index) => {
                    editor.insertEmbed(range.index + index, "customImage", {
                        url: url,
                        width: width,
                        height: height,
                        loading: "lazy",
                        decoding: "async",
                    });
                });
                editor.setSelection(range.index + files.length + 1);
            } catch (error) {
                if (isAxiosError(error) && error.response) {
                    alert(error.response.data.message);
                }
                console.log(error);
            }
            setLoading(false);
        });
    };

    const modules = useMemo(() => {
        return {
            toolbar: {
                container: [
                    [{ size: fontSizeArr }],
                    [{ align: ["justify", "center", "right"] }],
                    ["bold", "italic", "underline", "strike"],
                    ["link", "image"],
                    [{ color: colorOptions }, { background: colorOptions }],
                    [
                        { list: "ordered" },
                        { list: "bullet" },
                        { indent: "-1" },
                        { indent: "+1" },
                    ],
                ],
                history: {
                    delay: 200,
                    maxStack: 100,
                    userOnly: true,
                },
                handlers: {
                    size: function (value: number) {
                        if (value) {
                            editorRef.current
                                ?.getEditor()
                                .format("size", value);
                        } else {
                            editorRef.current
                                ?.getEditor()
                                .format("size", false);
                        }
                    },
                    image: imageHandler,
                },
            },
            imageDropAndPaste: {
                handler: imagePasteHandler,
            },
        };
    }, [editorRef]);

    return (
        <>
            {editorRef && (
                <ReactQuill
                    className="w-full h-[calc(100vh-380px)] mt-2"
                    ref={editorRef}
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    value={content}
                    onChange={(e) => {
                        setLocalContent(e);
                        console.log(e);
                    }}
                />
            )}
        </>
    );
}
