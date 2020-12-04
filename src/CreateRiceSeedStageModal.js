import { useState, useCallback, useEffect } from "react";
import {
  Modal,
  Layout,
  TextField,
  Button,
  Spinner,
  Select,
  Stack,
  ResourceList,
  ResourceItem,
  Checkbox,
  TextStyle,
} from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { withFirebase } from "./firebase";
import { nanoid } from "nanoid";

const CreateRiceSeedStageModal = ({
  firebase,
  shouldOpen,
  handleModalClosed,
  defaultRiceSeedStage,
  handleAddTaskButtonClicked,
  selectedStageTasks,
  handleModalDone,
}) => {
  const [defaultRiceSeedStageData, setDefaultRiceSeedStageData] = useState({
    stageName: "",
    period: "1",
    startDate: "",
    endDate: "",
    tasks: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (Object.values(defaultRiceSeedStage).length > 0) {
      setDefaultRiceSeedStageData({
        stageName: defaultRiceSeedStage.stageName,
        period: defaultRiceSeedStage.period,
        startDate: defaultRiceSeedStage.startDate,
        endDate: defaultRiceSeedStage.endDate,
        tasks: defaultRiceSeedStage.tasks.map((stageTask) => {
          return { ...stageTask, isChecked: true };
        }),
      });
    }
  }, [defaultRiceSeedStage]);

  useEffect(() => {
    if (selectedStageTasks.length > 0 && selectedStageTasks[0]) {
      let startDate = selectedStageTasks[0].startDate;
      let endDate = selectedStageTasks[0].endDate;
      selectedStageTasks.forEach((stageTask) => {
        if (parseInt(stageTask.startDate) < parseInt(startDate)) {
          startDate = stageTask.startDate;
        }
        if (parseInt(stageTask.endDate) > parseInt(endDate)) {
          endDate = stageTask.endDate;
        }
      });
      setDefaultRiceSeedStageData({
        ...defaultRiceSeedStageData,
        tasks: selectedStageTasks.map((stageTask) => {
          return { ...stageTask, isChecked: true };
        }),
        startDate,
        endDate,
      });
    }
  }, [selectedStageTasks]);

  const { fields, dirty } = useForm({
    fields: {
      stageName: useField({
        value: defaultRiceSeedStageData.stageName,
        validates: (stageName) => {
          if (stageName.trim().length < 1) {
            return "Stage Name field is required";
          }
        },
      }),
    },
  });

  const formObjectInArray = Object.values(fields);
  const hasValidationError = formObjectInArray.some((field) => {
    return field.error || field.value.trim().length < 1;
  });

  const handleRiceSeedStagePeriodChange = useCallback(
    (value) => {
      setDefaultRiceSeedStageData({
        ...defaultRiceSeedStageData,
        period: value,
      });
    },
    [defaultRiceSeedStageData]
  );

  const modalBtnContent =
    Object.values(defaultRiceSeedStage).length > 0
      ? "Update Rice Seed Stage"
      : "Create Rice Seed Stage";

  return (
    <Modal
      title={modalBtnContent}
      open={shouldOpen}
      onClose={handleModalClosed}
      primaryAction={{
        content: modalBtnContent,
        onAction: async () => {
          setIsLoading(true);
          const docId = nanoid();
          defaultRiceSeedStageData.tasks.forEach((task) => {
            delete task.isChecked;
          });
          const data = {
            stageName: fields.stageName.value,
            period: defaultRiceSeedStageData.period,
            startDate: defaultRiceSeedStageData.startDate,
            endDate: defaultRiceSeedStageData.endDate,
            tasks: defaultRiceSeedStageData.tasks,
          };
          if (Object.values(defaultRiceSeedStage).length > 0) {
            await firebase.firestore
              .collection("stage")
              .doc(process.env.REACT_APP_STAGES_ID)
              .collection("data")
              .doc(defaultRiceSeedStage.id)
              .update(data);
          } else {
            await firebase.firestore
              .collection("stage")
              .doc(process.env.REACT_APP_STAGES_ID)
              .collection("data")
              .doc(docId)
              .set({
                id: docId,
                ...data,
              });
          }
          handleModalDone();
          setIsLoading(false);
        },
        disabled:
          (!dirty && !Object.values(defaultRiceSeedStage).length > 0) ||
          hasValidationError ||
          defaultRiceSeedStageData.startDate.trim().length < 1 ||
          defaultRiceSeedStageData.endDate.trim().length < 1 ||
          defaultRiceSeedStageData.tasks.length < 1 ||
          defaultRiceSeedStageData.tasks.filter((task) => task.isChecked)
            .length < 1,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleModalClosed,
        },
      ]}
      large
    >
      <Modal.Section>
        <Layout>
          <Layout.AnnotatedSection title="Rice Seed Stage Name">
            <TextField {...fields.stageName} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Stage Period">
            <Select
              options={[
                { label: "Period 1", value: "1" },
                { label: "Period 2", value: "2" },
                { label: "Period 3", value: "3" },
              ]}
              value={defaultRiceSeedStageData.period}
              onChange={handleRiceSeedStagePeriodChange}
            />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Stage Start Date">
            <TextField
              value={defaultRiceSeedStageData.startDate}
              disabled={true}
            />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed End Date">
            <TextField
              value={defaultRiceSeedStageData.endDate}
              disabled={true}
            />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Rice Seed Tasks">
            {
              <Stack>
                <Stack vertical>
                  <Stack.Item>
                    <Stack distribution="fillEvenly">
                      {defaultRiceSeedStageData.tasks.map((task, index) => (
                        <Stack.Item key={index}>
                          <Checkbox
                            id={task.id}
                            label={task.task}
                            checked={task.isChecked}
                            onChange={(newCheck, id) => {
                              const clonedTasks = [
                                ...defaultRiceSeedStageData.tasks,
                              ];
                              const index = clonedTasks.findIndex(
                                (type) => type.id === id
                              );
                              clonedTasks[index].isChecked = newCheck;
                              setDefaultRiceSeedStageData({
                                ...defaultRiceSeedStageData,
                                tasks: clonedTasks,
                              });
                            }}
                          />
                        </Stack.Item>
                      ))}
                    </Stack>
                  </Stack.Item>
                </Stack>
                <Stack.Item>
                  <Button primary onClick={handleAddTaskButtonClicked}>
                    Add Task
                  </Button>
                </Stack.Item>
              </Stack>
            }
          </Layout.AnnotatedSection>
        </Layout>
      </Modal.Section>
    </Modal>
  );
};

export default withFirebase(CreateRiceSeedStageModal);
