import React from 'react';
import DocumentUploadFactory from '@/components/organisms/DocumentUpload/DocumentUploadFactory';
import { DocumentItem } from '../partyTypes';

interface DocumentUploadStepProps {
  partyId: string;
  onDocumentsChange?: (documents: DocumentItem[]) => void;
  isOptional?: boolean;
  isReadOnly?: boolean;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({ 
  partyId, 
  onDocumentsChange,
  isOptional = true,
  isReadOnly = false
}) => {
  return (
    <DocumentUploadFactory
      type="PARTY"
      entityId={partyId}
      isOptional={isOptional}
      isReadOnly={isReadOnly}
      {...(onDocumentsChange && { onDocumentsChange })}
      formFieldName="documents"
    />
  );
};

export default DocumentUploadStep;
