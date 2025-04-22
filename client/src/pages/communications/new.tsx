import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import AppLayout from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertCommunicationSchema, type InsertCommunication, type Parent } from "@shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  parentId: z.number().min(1, "Parent is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["email", "sms", "notification"]),
  status: z.enum(["sent", "read", "failed"]),
  sentDate: z.string().min(1, "Sent date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCommunication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Load parents for the selection dropdown
  const { data: parents, isLoading: isLoadingParents } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId: 0,
      subject: "",
      message: "",
      type: "email",
      status: "sent",
      sentDate: new Date().toISOString().split('T')[0],
    }
  });

  // Create mutation for submitting the form
  const createCommunicationMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/communications", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creating communication");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Communication created successfully",
        description: "The communication has been added to the system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/communications'] });
      navigate("/communications");
    },
    onError: (error) => {
      console.error("Error creating communication:", error);
      toast({
        title: "Error creating communication",
        description: error.message || "There was an error creating the communication",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createCommunicationMutation.mutate(data);
  };

  return (
    <AppLayout title="Create New Communication">
      <div className="mb-8">
        <p className="text-gray-500">Send a new communication to a parent or guardian</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Communication Details</CardTitle>
          <CardDescription>
            Enter the information for the new communication
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent/Guardian</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent/guardian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingParents ? (
                          <SelectItem value="loading" disabled>Loading parents...</SelectItem>
                        ) : parents && parents.length > 0 ? (
                          parents.map((parent) => (
                            <SelectItem key={parent.id} value={parent.id.toString()}>
                              {parent.name} ({parent.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No parents available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the recipient of this communication
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Subject line of the communication" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Content of the communication" 
                        className="min-h-[150px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="notification">Notification</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The method of communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of the communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Sent Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => date && field.onChange(date.toISOString().split('T')[0])}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/communications")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingParents || !parents || parents.length === 0}
              >
                {isSubmitting ? "Sending..." : "Send Communication"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}