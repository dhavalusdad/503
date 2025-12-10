import React, { type ImgHTMLAttributes, useState } from 'react';

type imgPathType = string | File;

interface ImageProps {
  imgPath: imgPathType;
  isServerPath?: boolean;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
  alt?: string;
  imgAttribute?: ImgHTMLAttributes<HTMLImageElement>;
  onClick?: (event: React.MouseEvent<HTMLImageElement>) => void;
  firstName?: string;
  lastName?: string;
  initialClassName?: string;
}

export const Image: React.FC<ImageProps> = ({
  imgPath,
  width,
  height,
  className,
  imageClassName,
  alt,
  imgAttribute,
  onClick,
  firstName,
  lastName,
  initialClassName,
}) => {
  const [hasError, setHasError] = useState(false);
  const getFilePath = (path: imgPathType | undefined): string | undefined => {
    if (path instanceof File) {
      try {
        return URL.createObjectURL(path);
      } catch {
        setHasError(true);
        return undefined;
      }
    }
    if (typeof path === 'string') {
      return path;
    }
    return undefined;
  };
  const renderFallback = () => {
    if (firstName || lastName) {
      const initials = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`;
      return (
        <div
          onClick={onClick}
          className={`flex items-center justify-center bg-gray-200 text-gray-700 font-bold md:text-3xl w-full h-full rounded-full ${initialClassName}`}
        >
          {initials.toUpperCase()}
        </div>
      );
    }

    return (
      <img
        {...imgAttribute}
        height={height}
        width={width}
        src={'/images/default-user-image.webp'}
        alt={alt || ''}
        className={`w-full h-full ${imageClassName}`}
        onClick={onClick}
      />
    );
  };

  const filePath = imgPath && !hasError ? getFilePath(imgPath) : undefined;
  return (
    <div className={className}>
      {filePath && !hasError ? (
        <img
          {...imgAttribute}
          height={height}
          width={width}
          src={getFilePath(imgPath)}
          alt={alt || ''}
          className={`w-full h-full ${imageClassName}`}
          onClick={onClick}
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default Image;
