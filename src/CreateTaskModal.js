import {
  Modal,
  ResourceList,
  ResourceItem,
  TextStyle,
  Layout,
  TextField,
  InlineError,
  Banner,
  List,
  Stack,
  Checkbox,
} from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { withFirebase } from "./firebase";
import DatePicker from "react-datepicker";
import { useField, useForm, notEmpty } from "@shopify/react-form";
import { nanoid } from "nanoid";

const _MS_PER_DAY = 1000 * 60 * 60 * 24;

const dateDiffInDays = (firstDate, secondDate) => {
  const utc1 = Date.UTC(
    firstDate.getFullYear(),
    firstDate.getMonth(),
    firstDate.getDate()
  );
  const utc2 = Date.UTC(
    secondDate.getFullYear(),
    secondDate.getMonth(),
    secondDate.getDate()
  );
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

const CreateTaskModal = ({ firebase, shouldOpen, handleModalClosed }) => {
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [defaultTaskData, setDefaultTaskData] = useState({
    task: "",
    repeat: "",
    days: "0",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [multiSelectionChecked, setMultiSelectionChecked] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);

  const { fields, submit, dirty, submitting } = useForm({
    fields: {
      task: useField({
        value: defaultTaskData.task,
        validates: (task) => {
          if (task.trim().length < 1) {
            return "Task field is required";
          }
        },
      }),
      repeat: useField({
        value: defaultTaskData.repeat,
        validates: (repeat) => {
          if (repeat.trim().length < 1) {
            return "Repeat field is required";
          } else if (!parseInt(repeat)) {
            return "Repeat must be a valid number";
          }
        },
      }),
      startDate: useField({
        value: defaultTaskData.startDate,
        validates: [
          notEmpty("Start date field is required"),
          (startDate) => {
            if (startDate > fields.endDate.value) {
              return "Start date must be lesser than end date";
            }
          },
        ],
      }),
      endDate: useField({
        value: defaultTaskData.endDate,
        validates: [
          notEmpty("End date field is required"),
          (endDate) => {
            if (endDate < fields.startDate.value) {
              return "End date must be greater than end date";
            }
          },
        ],
      }),
    },
    onSubmit: async (fieldValues) => {
      const docId = nanoid();
      try {
        await firebase.firestore
          .collection("task")
          .doc(process.env.REACT_APP_TASKS_ID)
          .collection("data")
          .doc(docId)
          .set({
            id: docId,
            days: defaultTaskData.days,
            task: fields.task.value,
            endDate: new Date(fields.endDate.value).getDay().toString(),
            repeat: fields.repeat.value,
            startDate: new Date(fields.startDate.value).getDay().toString(),
          });
        getTasks();
        setDefaultTaskData({
          task: "",
          repeat: "",
          days: "0",
          startDate: new Date(),
          endDate: new Date(),
        });
        return { status: "success" };
      } catch (err) {
        console.error("firebase error in create rice seed", err);
        setErrorMessages([...errorMessages, "Server error occurred"]);
        return { status: "fail" };
      }
    },
  });

  const getTasks = useCallback(async () => {
    setIsLoading(true);
    const firebaseTasks = await firebase.firestore
      .collection("task")
      .doc(process.env.REACT_APP_TASKS_ID)
      .collection("data")
      .get();
    setTasks(
      firebaseTasks.docs.map((task) => {
        const taskData = task.data();
        return {
          id: taskData.id,
          task: taskData.task,
          repeat: taskData.repeat,
          days: taskData.days,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
        };
      })
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    getTasks();
  }, []);

  const formObjectInArray = Object.values(fields);
  const hasValidationError = formObjectInArray.some((field) => {
    return field.error || field.value.toString().trim().length < 1;
  });

  const startDateError = fields.startDate.error ? (
    <InlineError message={fields.startDate.error} fieldID={`start-date`} />
  ) : null;

  const endDateError = fields.endDate.error ? (
    <InlineError message={fields.endDate.error} fieldID="end-date" />
  ) : null;

  const filterControl = !multiSelectionChecked && (
    <table className="table-container" role="table" aria-label="Rice seeds">
      <thead>
        <tr className="flex-table header" role="rowgroup">
          <th style={{ width: "4%" }}>
            <Checkbox
              checked={multiSelectionChecked}
              onChange={() => {
                setMultiSelectionChecked(!multiSelectionChecked);
                setSelectedTasks(tasks.map((task) => task.id));
              }}
            />
          </th>
          <th className="flex-row-20" role="columnheader">
            <TextStyle variation="strong">Task</TextStyle>
          </th>
          <th className="flex-row-20" role="columnheader">
            <TextStyle variation="strong">Repeat</TextStyle>
          </th>
          <th className="flex-row-20" role="columnheader">
            <TextStyle variation="strong">Days</TextStyle>
          </th>
          <th className="flex-row-20" role="columnheader">
            <TextStyle variation="strong">Start Date</TextStyle>
          </th>
          <th className="flex-row-20" role="columnheader">
            <TextStyle variation="strong">End Date</TextStyle>
          </th>
        </tr>
      </thead>
    </table>
  );

  const renderItem = useCallback(
    (task, id) => (
      <ResourceItem id={task.id}>
        <table className="table-container">
          <tbody>
            <tr className="flex-table row" role="rowgroup">
              <td style={{ width: "4%" }}>
                {!multiSelectionChecked ? (
                  <Checkbox
                    onChange={() => {
                      setSelectedTasks([task.id]);
                      setMultiSelectionChecked(true);
                    }}
                  />
                ) : null}
              </td>
              <td
                className="flex-row-20"
                style={{ textAlign: "center" }}
                role="cell"
              >
                {task.task}
              </td>
              <td
                className="flex-row-20"
                style={{ textAlign: "center" }}
                role="cell"
              >
                {task.repeat}
              </td>
              <td
                className="flex-row-20"
                style={{ textAlign: "center" }}
                role="cell"
              >
                {task.days}
              </td>
              <td
                className="flex-row-20"
                style={{ textAlign: "center" }}
                role="cell"
              >
                {task.startDate}
              </td>
              <td
                className="flex-row-20"
                style={{ textAlign: "center" }}
                role="cell"
              >
                {task.endDate}
              </td>
            </tr>
          </tbody>
        </table>
      </ResourceItem>
    ),
    [multiSelectionChecked]
  );

  const handleTaskChange = useCallback((value) => {
    setDefaultTaskData({ ...defaultTaskData, task: value });
  }, []);

  const handleStartDateChange = useCallback((value) => {
    setDefaultTaskData({ ...defaultTaskData, startDate: value });
  }, []);

  const handleEndDateChange = useCallback((value) => {
    setDefaultTaskData({ ...defaultTaskData, endDate: value });
  }, []);

  useEffect(() => {
    const dateDiff = dateDiffInDays(
      fields.startDate.value,
      fields.endDate.value
    );
    if (
      dateDiff >= 0 &&
      dateDiff.toString() !== defaultTaskData.days.toString()
    ) {
      setDefaultTaskData({ ...defaultTaskData, days: dateDiff.toString() });
    }
  }, [fields]);

  const errorMessagesBanner = errorMessages.length > 0 && (
    <Banner title="Errors" status="critical">
      <List type="bullet">
        {errorMessages.map((message, index) => (
          <List.Item key={index}>{message}</List.Item>
        ))}
      </List>
    </Banner>
  );

  const promotedBulkActions = [
    {
      content: "Delete",
      onAction: async () => {
        setIsLoading(true);
        for (let i = 0; i < selectedTasks.length; i++) {
          await firebase.firestore
            .collection("task")
            .doc(process.env.REACT_APP_TASKS_ID)
            .collection("data")
            .doc(selectedTasks[i])
            .delete();
        }
        setSelectedTasks([]);
        getTasks();
        setIsLoading(false);
      },
    },
  ];

  return (
    <Modal
      title="Create Task"
      open={shouldOpen}
      onClose={() => {
        handleModalClosed(
          tasks.map((task) => {
            if (selectedTasks.includes(task.id)) {
              return task;
            }
          })
        );
      }}
      primaryAction={{
        content: "Create Task",
        onAction: submit,
        disabled: !dirty || submitting || hasValidationError,
        loading: submitting,
      }}
      secondaryActions={[
        {
          content: "Close",
          onAction: () => {
            handleModalClosed(
              tasks.map((task) => {
                if (selectedTasks.includes(task.id)) {
                  return task;
                }
              })
            );
          },
        },
      ]}
      large
    >
      <Modal.Section>
        <Layout>
          <Layout.AnnotatedSection title="Task">
            <TextField {...fields.task} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Repeat">
            <TextField {...fields.repeat} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Start Date">
            <DatePicker
              id="start-date"
              selected={fields.startDate.value}
              onChange={(date) => {
                fields.startDate.onChange(date);
                if (!date) {
                  fields.startDate.runValidation(date);
                }
              }}
            />
            {startDateError}
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="Days">
            <TextField value={defaultTaskData.days} disabled={true} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection title="End Date">
            <DatePicker
              id="end-date"
              selected={fields.endDate.value}
              onChange={(date) => {
                fields.endDate.onChange(date);
                if (!date) {
                  fields.endDate.runValidation(date);
                }
              }}
            />
            {endDateError}
          </Layout.AnnotatedSection>
        </Layout>
        <ResourceList
          items={tasks}
          renderItem={renderItem}
          filterControl={filterControl}
          loading={isLoading}
          emptyState={<Stack distribution="center">No task found</Stack>}
          onSelectionChange={(tasks) => {
            setSelectedTasks(tasks);
            if (tasks.length < 1) {
              setMultiSelectionChecked(false);
            }
          }}
          selectedItems={multiSelectionChecked ? selectedTasks : []}
          promotedBulkActions={multiSelectionChecked ? promotedBulkActions : ""}
        />
      </Modal.Section>
    </Modal>
  );
};

export default withFirebase(CreateTaskModal);
