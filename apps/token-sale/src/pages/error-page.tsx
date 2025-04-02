import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Button,
} from "@bltzr-gg/ui";
import { environment } from "utils/environment";
import { ErrorResponse, Link, useRouteError } from "react-router-dom";
import { ArrowBigLeft } from "lucide-react";

const showError = !environment.isProduction;

/** Error boundary to inform users */
export default function ErrorPage() {
  const error = useRouteError() as ErrorResponse & Error & { error?: Error };

  const name = error?.error?.name ?? error?.name;
  const message = error?.error?.message ?? error?.message;
  const stack = error?.error?.stack ?? error?.stack;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `Name: ${name} ## Message: ${message} ## Stacktrace: ${stack}`,
    );
  };

  return (
    <div
      id="__AXIS_ERROR_PAGE__"
      className="flex h-screen flex-col items-center justify-center"
    >
      <div id="error-page" className="container px-5 text-center">
        <h1>Oops!</h1>
        <p className="mt-2">Something has gone wrong...</p>

        {showError && stack && (
          <AccordionRoot collapsible type="single">
            <AccordionItem value={"item-0"}>
              <AccordionTrigger className="my-5  text-center">
                Show error details
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <code className="block">{stack}</code>

                <Button onClick={() => handleCopy()} className="mt-4 uppercase">
                  Copy Error Details
                </Button>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        )}

        <Button className="mt-4" variant="outline">
          <Link to="/">
            <ArrowBigLeft className="mb-0.5 mr-1 inline" />
            Head back
          </Link>
        </Button>
      </div>
    </div>
  );
}
