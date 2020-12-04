import { withFirebase } from "./firebase";
import {
  Page,
  Toast,
  Frame,
  Card,
  ResourceList,
  ResourceItem,
  TextStyle,
  Button,
} from "@shopify/polaris";
import { useState, useEffect, useCallback } from "react";
import CreateRiceSeedStageModal from "./CreateRiceSeedStageModal";
import CreateTaskModal from "./CreateTaskModal";
import DatePicker from "react-datepicker";
import DeleteModal from "./DeleteModal";

const ManageRiceSeedStages = ({ firebase }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [riceSeedStages, setRiceSeedStages] = useState([]);
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);
  const [shouldModalOpen, setShouldModalOpen] = useState(false);
  const [shouldOpenTaskModal, setShouldOpenTaskModal] = useState(false);
  const [selectedStageTasks, setSelectedStageTasks] = useState([]);
  const [shouldDeleteModalOpen, setShouldDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [stageToBeDeleted, setStageToBeDeleted] = useState({});
  const [stageToBeEdited, setStageToBeEdited] = useState({});

  useEffect(() => {
    getRiceSeedStages();
  }, []);

  const getRiceSeedStages = useCallback(async () => {
    setIsLoading(true);
    const stages = await firebase.firestore
      .collection("stage")
      .doc(process.env.REACT_APP_STAGES_ID)
      .collection("data")
      .get();
    setRiceSeedStages(
      stages.docs.map((stage) => {
        return stage.data();
      })
    );
    setIsLoading(false);
  }, []);

  const displayToast = useCallback(
    (content, error = false, duration = 2500) => {
      setToastInfo({ ...toastInfo, content, error, duration });
      setShowToast(true);
    },
    [toastInfo]
  );

  const handleDismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  const handleAddRiceSeedStageButtonClicked = useCallback(() => {
    setShouldModalOpen(true);
  }, []);

  const handleModalClosed = useCallback(() => {
    setShouldModalOpen(false);
    setStageToBeEdited({});
  }, []);

  const handleDeleteRiceSeedStage = useCallback((item) => {
    setShouldDeleteModalOpen(true);
    setStageToBeDeleted(item);
  }, []);

  const handleEditRiceSeedStage = useCallback((item) => {
    setShouldModalOpen(true);
    setStageToBeEdited(item);
  }, []);

  const handleDeleteModalClosed = useCallback(() => {
    setShouldDeleteModalOpen(false);
  }, []);

  const handleDeleteModalDone = useCallback(async () => {
    setIsDeleting(true);
    await firebase.firestore
      .collection("stage")
      .doc(process.env.REACT_APP_STAGES_ID)
      .collection("data")
      .doc(stageToBeDeleted.id)
      .delete();
    displayToast("Rice seed stage deleted successfully!");
    getRiceSeedStages();
    setShouldDeleteModalOpen(false);
    setIsDeleting(false);
  }, [stageToBeDeleted]);

  const resourceListHeaders = (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Stage Name</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Stage Period</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Start Date</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">End Date</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <TextStyle variation="strong">Tasks</TextStyle>
          </th>
          <th className="flex-row" role="columnheader">
            <Button primary onClick={handleAddRiceSeedStageButtonClicked}>
              Add Rice Seed Stage
            </Button>
          </th>
        </tr>
      </thead>
    </table>
  );

  const renderItem = useCallback((item, id) => {
    return (
      <ResourceItem id={id} onClick={() => {}}>
        <table className="table-container">
          <tbody>
            <tr className="flex-table row" role="rowgroup">
              <td className="flex-row" role="cell">
                {item.stageName}
              </td>
              <td className="flex-row" role="cell">
                {item.period}
              </td>
              <td className="flex-row" role="cell">
                {item.startDate}
              </td>
              <td className="flex-row" role="cell">
                {item.endDate}
              </td>
              <td className="flex-row" role="cell">
                {item.tasks.map((task) => task.task).join(",")}
              </td>
              <td className="flex-row" role="cell">
                <div
                  style={{
                    marginRight: ".8rem",
                    display: "inline",
                  }}
                >
                  <Button
                    plain
                    onClick={() => {
                      handleEditRiceSeedStage(item);
                    }}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  plain
                  destructive
                  onClick={() => {
                    handleDeleteRiceSeedStage(item);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </ResourceItem>
    );
  }, []);

  const handleAddTaskButtonClicked = useCallback(() => {
    setShouldModalOpen(false);
    setShouldOpenTaskModal(true);
  }, []);

  const handleTaskModalClosed = useCallback((tasks) => {
    setSelectedStageTasks(tasks);
    setShouldOpenTaskModal(false);
    setShouldModalOpen(true);
  }, []);

  return (
    <Page fullWidth>
      <Frame>
        {showToast && <Toast {...toastInfo} onDismiss={handleDismissToast} />}
        <Card>
          <ResourceList
            loading={isLoading}
            filterControl={resourceListHeaders}
            items={riceSeedStages}
            renderItem={renderItem}
          />
          <CreateRiceSeedStageModal
            shouldOpen={shouldModalOpen}
            handleModalClosed={handleModalClosed}
            handleModalDone={() => {
              setShouldModalOpen(false);
              getRiceSeedStages();
            }}
            defaultRiceSeedStage={stageToBeEdited}
            handleAddTaskButtonClicked={handleAddTaskButtonClicked}
            selectedStageTasks={selectedStageTasks}
          />
          <CreateTaskModal
            shouldOpen={shouldOpenTaskModal}
            handleModalClosed={handleTaskModalClosed}
          />
          <DeleteModal
            shouldOpen={shouldDeleteModalOpen}
            handleModalClosed={handleDeleteModalClosed}
            title="Delete Rice Seed Stage"
            isDeleting={isDeleting}
            handlePrimaryActionClicked={handleDeleteModalDone}
          />
        </Card>
      </Frame>
    </Page>
  );
};

export default withFirebase(ManageRiceSeedStages);
