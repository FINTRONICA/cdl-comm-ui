"use client";
import React, { useState, DragEvent, useEffect } from "react";
import { Drawer, Box, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { X, CheckCircle } from "lucide-react";
import { fi } from "zod/v4/locales";
import { FileText, FileSpreadsheet, File } from "lucide-react";
import { v4 as uuidv4 } from "uuid";


type FileIconProps = {
  fileName: string;
  className?: string;
};

export function FileIcon({ fileName, className }: FileIconProps) {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "pdf") {
    return (
      <svg
        width="24"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className} // allows customizing size, color, etc. when using
      >
        <path
          d="M14.6668 1.66699V7.00033C14.6668 7.70757 14.9478 8.38585 15.4479 8.88594C15.948 9.38604 16.6263 9.66699 17.3335 9.66699H22.6668M8.00016 16.3337V15.0003H16.0002V16.3337M12.0002 15.0003V23.0003M10.6668 23.0003H13.3335M16.0002 1.66699H4.00016C3.29292 1.66699 2.61464 1.94794 2.11454 2.44804C1.61445 2.94814 1.3335 3.62641 1.3335 4.33366V25.667C1.3335 26.3742 1.61445 27.0525 2.11454 27.5526C2.61464 28.0527 3.29292 28.3337 4.00016 28.3337H20.0002C20.7074 28.3337 21.3857 28.0527 21.8858 27.5526C22.3859 27.0525 22.6668 26.3742 22.6668 25.667V8.33366L16.0002 1.66699Z"
          stroke="#CAD5E2"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else if (["doc", "docx"].includes(ext || "")) {
    return (
      <svg
        width="24"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M18.6668 2.66699V8.00033C18.6668 8.70757 18.9478 9.38585 19.4479 9.88594C19.948 10.386 20.6263 10.667 21.3335 10.667H26.6668M13.3335 12.0003H10.6668M21.3335 17.3337H10.6668M21.3335 22.667H10.6668M20.0002 2.66699H8.00016C7.29292 2.66699 6.61464 2.94794 6.11454 3.44804C5.61445 3.94814 5.3335 4.62641 5.3335 5.33366V26.667C5.3335 27.3742 5.61445 28.0525 6.11454 28.5526C6.61464 29.0527 7.29292 29.3337 8.00016 29.3337H24.0002C24.7074 29.3337 25.3857 29.0527 25.8858 28.5526C26.3859 28.0525 26.6668 27.3742 26.6668 26.667V9.33366L20.0002 2.66699Z"
          stroke="#CAD5E2"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else if (["xls", "xlsx", "csv"].includes(ext || "")) {
    return (
      <svg
        width="24"
        height="30"
        viewBox="0 0 30 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}// allows customizing size, color, etc. when using
      >
        <path
          d="M18.6668 2.66699V8.00033C18.6668 8.70757 18.9478 9.38585 19.4479 9.88594C19.948 10.386 20.6263 10.667 21.3335 10.667H26.6668M12.0002 20.0003H20.0002M16.0002 24.0003V16.0003M20.0002 2.66699H8.00016C7.29292 2.66699 6.61464 2.94794 6.11454 3.44804C5.61445 3.94814 5.3335 4.62641 5.3335 5.33366V26.667C5.3335 27.3742 5.61445 28.0525 6.11454 28.5526C6.61464 29.0527 7.29292 29.3337 8.00016 29.3337H24.0002C24.7074 29.3337 25.3857 29.0527 25.8858 28.5526C26.3859 28.0525 26.6668 27.3742 26.6668 26.667V9.33366L20.0002 2.66699Z"
          stroke="#CAD5E2"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

}



type FileUpload = {
  id: number;
  name: string;
  date: string;
  type: string;
  size: string;
  progress: number;
  status: "uploading" | "completed";
};

interface RightSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  sendFileData: (data: []) => void;
}


export const RightSlideDocumentsPanel: React.FC<RightSlidePanelProps> = ({ isOpen, onClose, sendFileData }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  // const [counter, setCounter] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const [sidebarOpen, setSidebarOpen] = useState(isOpen);
  // Convert size to MB




  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + " MB";


  const handleSubmit = () => {
    sendFileData(files as unknown as []);
  };


  // Handle file validation and upload simulation
  const handleFiles = (selectedFiles: FileList) => {
    const MAX_SIZE = 25 * 1024 * 1024; // 25 MB
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const newFiles: FileUpload[] = [];
    let errorMsg: string | null = null;

    Array.from(selectedFiles).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errorMsg = "Invalid file type. Only PDF, Word, and Excel files are allowed.";
        return;
      }
      if (file.size > MAX_SIZE) {
        errorMsg = "File too large (max 25MB)";
        return;
      }

      // const id = counter + 1;
      // setCounter(id);

      newFiles.push({
        id: uuidv4() as unknown as number,
        name: file.name,
        size: (parseInt(formatSize(file.size)) < 1) ? Math.floor(file.size / 1000) + " KB" : formatSize(file.size),
        date: new Date(file.lastModified).toISOString(),
        type: file.type,
        progress: 0,
        status: "uploading",
      });
    });

    if (errorMsg) {
      setError(errorMsg);
      setTimeout(() => setError(null), 4000);
    }

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((file) => {
        const interval = setInterval(() => {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === file.id
                ? {
                  ...f,
                  progress: Math.min(f.progress + 10, 100),
                  status: f.progress + 10 >= 100 ? "completed" : "uploading",
                }
                : f
            )
          );
        }, 500);

        setTimeout(() => clearInterval(interval), 6000);
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) handleFiles(event.target.files);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };



  useEffect(() => {
    if (!isOpen) {
      handleSubmit();
      setFiles([]);
      onClose();
    }
  }, [isOpen]);

 

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={onClose}
        PaperProps={{
          sx: {
            marginRight:2,
            marginTop: 2,
            marginBottom: 2,
            width: 460,
            height: 880,
            borderRadius: 3,

            backdropFilter: "blur(15px)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "-8px 0px 8px 0px #62748E14",
            p: 2,
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 500,
            fontSize: "20px",
          }}
        >
          Upload Documents
          <IconButton  onClick={onClose}>
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2 }}>
          {/* Upload box */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-2 transition 
            ${dragActive ? "border-blue-500 bg-blue-100" : "border-blue-400 bg-blue-50"}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >

            <svg width="80" height="81" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[80px] w-[80px] mx-auto mb-2 opacity-70" > <g opacity="0.2"> <path d="M27.3077 72.1663C25.6243 72.1663 24.1993 71.583 23.0327 70.4163C21.866 69.2497 21.2827 67.8244 21.2827 66.1405V59.2172H14.3593C12.6754 59.2172 11.2502 58.6338 10.0835 57.4672C8.91683 56.3005 8.3335 54.8755 8.3335 53.1922V47.038H13.3335V53.1922C13.3335 53.4911 13.4296 53.7366 13.6218 53.9288C13.8141 54.1216 14.0599 54.218 14.3593 54.218H21.2827V27.8072C21.2827 26.1238 21.866 24.6988 23.0327 23.5322C24.1993 22.3655 25.6243 21.7822 27.3077 21.7822H53.7185V14.8588C53.7185 14.5594 53.6221 14.3136 53.4293 14.1213C53.2371 13.9291 52.9916 13.833 52.6927 13.833H46.5385V8.83301H52.6927C54.376 8.83301 55.801 9.41634 56.9677 10.583C58.1343 11.7497 58.7177 13.175 58.7177 14.8588V21.7822H65.641C67.3249 21.7822 68.7502 22.3655 69.9168 23.5322C71.0835 24.6988 71.6668 26.1238 71.6668 27.8072V66.1405C71.6668 67.8244 71.0835 69.2497 69.9168 70.4163C68.7502 71.583 67.3249 72.1663 65.641 72.1663H27.3077ZM27.3077 67.1663H65.641C65.8977 67.1663 66.1327 67.0594 66.346 66.8455C66.5599 66.6322 66.6668 66.3972 66.6668 66.1405V27.8072C66.6668 27.5511 66.5599 27.3161 66.346 27.1022C66.1327 26.8883 65.8977 26.7813 65.641 26.7813H27.3077C27.0516 26.7813 26.8166 26.8883 26.6027 27.1022C26.3888 27.3161 26.2818 27.5511 26.2818 27.8072V66.1405C26.2818 66.3972 26.3888 66.6322 26.6027 66.8455C26.8166 67.0594 27.0516 67.1663 27.3077 67.1663ZM8.3335 39.7305V28.3205H13.3335V39.7305H8.3335ZM8.3335 21.0122V14.8588C8.3335 13.175 8.91683 11.7497 10.0835 10.583C11.2502 9.41634 12.6754 8.83301 14.3593 8.83301H20.5127V13.833H14.3593C14.0599 13.833 13.8141 13.9291 13.6218 14.1213C13.4296 14.3136 13.3335 14.5594 13.3335 14.8588V21.0122H8.3335ZM27.821 13.833V8.83301H39.231V13.833H27.821Z" fill="#155DFC" /> <path d="M53.859 57.872L41.6665 45.7312V56.2053H36.6665V37.167H55.7048V42.167H45.179L57.3398 54.3912L53.859 57.872Z" fill="#155DFC" /> </g> </svg>


            <p className="text-slate-500">Drag & Drop Your File Here</p>
            <p className="text-xs text-slate-500 mb-4">
              Please upload PDF, Excel, or Word Documents up to 25 MB
            </p>
            <label className="cursor-pointer">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm w-40 mx-auto">
                Browse Files
              </div>
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {/* Files list */}
          <div className="space-y-3  overflow-y-auto w-94">
            {files.map((file) => (

              <div key={file.id} className="p-4 border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  {/* Left: File icon + text */}
                  <div className="flex items-start gap-3 min-w-0">
                    <FileIcon fileName={file.name} className="w-[32px] h-[32px] " />

                    <div className="">
                      <p className="font-medium text-sm text-slate-800 max-w-[250px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.size}{" "}
                        {file.status === "completed"
                          ? "Completed"
                          : `${(100 - file.progress) / 10} sec. left`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Status/Cancel */}
                  {file.status === "completed" ? (
                    <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0 mt-2" />
                  ) : (
                    <CancelOutlinedIcon
                      className="cursor-pointer text-gray-400 hover:text-red-500 flex-shrink-0 mt-2"
                      onClick={() =>
                        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))
                      }
                    />
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all bg-blue-600"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <p className="text-right text-xs font-medium text-gray-600 mt-1">
                  {file.progress}%
                </p>
              </div>

            ))}
          </div>
        </DialogContent>


      </Drawer>

    </LocalizationProvider>
  );
};