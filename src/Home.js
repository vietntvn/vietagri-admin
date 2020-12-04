import {
  TextField,
  Frame,
  Form,
  Stack,
  Button,
  Toast,
  Spinner,
} from "@shopify/polaris";
import { useForm, useField } from "@shopify/react-form";
import { useState, useCallback, useEffect } from "react";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState({
    content: "",
    error: false,
    duration: 2500,
  });
  const [showToast, setShowToast] = useState(false);

  const displayToast = useCallback(
    (content, error = false, duration = 2500) => {
      setToastInfo({ ...toastInfo, content, error, duration });
      setShowToast(true);
    },
    [toastInfo]
  );

  useEffect(() => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");
    if (
      username === process.env.REACT_APP_ADMIN_USERNAME &&
      password === process.env.REACT_APP_ADMIN_PASSWORD
    ) {
      setIsLoggedIn(true);
      setIsLoading(false);
    } else {
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  }, []);

  const { fields, submit, dirty, submitting } = useForm({
    fields: {
      username: useField({
        value: "",
        validates: (username) => {
          if (username.trim().length < 1) {
            return "Username is required";
          }
        },
      }),
      password: useField({
        value: "",
        validates: (password) => {
          if (password.trim().length < 1) {
            return "Password is required";
          }
        },
      }),
    },
    onSubmit: async (fieldValues) => {
      if (
        fieldValues.username === process.env.REACT_APP_ADMIN_USERNAME &&
        fieldValues.password === process.env.REACT_APP_ADMIN_PASSWORD
      ) {
        localStorage.setItem("username", fieldValues.username);
        localStorage.setItem("password", fieldValues.password);
        displayToast("Logged in successfully");
        window.location.reload();
        return { status: "success" };
      } else {
        displayToast("Invalid credentials", true);
        return { status: "fail" };
      }
    },
  });

  const formObjectInArray = Object.values(fields);
  const hasValidationError = formObjectInArray.some((field) => {
    return field.error || field.value.trim().length < 1;
  });

  const handleDismissToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return (
    <Frame>
      {showToast && <Toast {...toastInfo} onDismiss={handleDismissToast} />}
      {isLoading ? (
        <Spinner />
      ) : (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -80%)",
            textAlign: "center",
          }}
        >
          {isLoggedIn ? (
            <h1>Welcome to VietAgri Admin</h1>
          ) : (
            <div>
              <h1>Admin Login</h1>
              <br />
              <br />
              <Form>
                <Stack vertical>
                  <Stack>
                    <Stack.Item>Username</Stack.Item>
                    <Stack.Item>
                      <TextField {...fields.username} />
                    </Stack.Item>
                  </Stack>

                  <Stack>
                    <Stack.Item>Password</Stack.Item>
                    <Stack.Item>
                      <TextField {...fields.password} type="password" />
                    </Stack.Item>
                  </Stack>

                  <Stack>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        transform: "translate(-50%)",
                      }}
                    >
                      <Button
                        primary
                        disabled={!dirty || submitting || hasValidationError}
                        loading={submitting}
                        onClick={submit}
                      >
                        Login
                      </Button>
                    </div>
                  </Stack>
                </Stack>
              </Form>
            </div>
          )}
        </div>
      )}
    </Frame>
  );
};

export default Home;
