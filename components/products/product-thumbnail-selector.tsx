"use client";

type MediaFile = {
  id?: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
};

type Props = {
  files: MediaFile[];
  onSelect: (id: string) => void;
};

export default function ProductThumbnailSelector({ files, onSelect }: Props) {
  if (files.length === 0) {
    return null;
  }

  const selectedId = String(files[0].id || files[0].url);

  return (
    <div className="px-5 pb-4">
      <h6 className="text-sm py-1">Thumbnail</h6>
      <div className="flex gap-3 overflow-x-auto py-2">
        {files.map((file) => {
          const id = String(file.id || file.url);
          const isSelected = id === selectedId;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                isSelected ? "border-black" : "border-transparent"
              }`}
            >
              <img src={file.url} className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[10px] text-white">
                {isSelected ? "Main" : "Set main"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
