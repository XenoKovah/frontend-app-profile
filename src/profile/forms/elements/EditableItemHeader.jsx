import React from 'react';
import PropTypes from 'prop-types';

const EditableItemHeader = ({
  content,
  headingId,
}) => (
  <div className="editable-item-header mb-2">
    <h2 className="edit-section-header" id={headingId}>
      {content}
    </h2>
  </div>
);

export default EditableItemHeader;

EditableItemHeader.propTypes = {
  content: PropTypes.node,
  headingId: PropTypes.string,
};

EditableItemHeader.defaultProps = {
  content: '',
  headingId: null,
};
