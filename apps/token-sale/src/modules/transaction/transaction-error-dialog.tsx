import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  Button,
} from "@bltzr-gg/ui";
import { getCustomException } from "utils/error-mapper";

export function TransactionErrorDialog(props: { error: Error }) {
  const error = getCustomException(props.error);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      `Name: ${props.error.name} ## Message: ${props.error.message} ## Stacktrace: ${props.error.stack}`,
    );
  };

  return (
    <div className="flex flex-col items-center gap-y-2">
      <p>Something went wrong with your transaction:</p>
      <div className="mt-2 flex flex-col items-center">{error?.name}</div>
      <AccordionRoot collapsible type="single">
        <AccordionItem
          value={"item-0"}
          className="flex flex-col items-center justify-center"
        >
          <AccordionTrigger>Show error details</AccordionTrigger>
          <AccordionContent>
            <p>{error.message}</p>

            <Button onClick={() => handleCopy()} className="mt-4 uppercase">
              Copy Error Details
            </Button>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>
    </div>
  );
}
