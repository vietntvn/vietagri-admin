import { Modal, TextContainer } from "@shopify/polaris";

const DeleteModal = (props) => {
  return (
    <Modal
      open={props.shouldOpen}
      onClose={props.handleModalClosed}
      title={props.title}
      primaryAction={{
        content: "Delete",
        onAction: props.handlePrimaryActionClicked,
        destructive: true,
        loading: props.isDeleting,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: props.handleModalClosed,
        },
      ]}
    >
      <Modal.Section>
        <TextContainer>
          <p>Are you sure you want to delete it?</p>
        </TextContainer>
      </Modal.Section>
    </Modal>
  );
};

export default DeleteModal;
