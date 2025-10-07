import React from 'react';
import DocumentUploadFactory from '../../DocumentUpload/DocumentUploadFactory';
import { DocumentItem } from '../developerTypes';

interface DocumentUploadStepProps {
  buildPartnerId: string;
  onDocumentsChange?: (documents: DocumentItem[]) => void;
  isOptional?: boolean;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ 
  buildPartnerId, 
  onDocumentsChange,
  isOptional = true 
}) => {
  return (
    <DocumentUploadFactory
      type="BUILD_PARTNER"
      entityId={buildPartnerId}
      isOptional={isOptional}
      {...(onDocumentsChange && { onDocumentsChange })}
      formFieldName="documents"
    />
  );
};

export default DocumentUploadStep;
