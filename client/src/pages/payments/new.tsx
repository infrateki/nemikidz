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
import { insertPaymentSchema, type InsertPayment, type Enrollment } from "@shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as z from "zod";

// Create a custom form schema that matches the database schema
const formSchema = z.object({
  enrollmentId: z.number().min(1, "Enrollment is required"),
  amount: z.string().min(1, "Amount is required"),
  paymentDate: z.string().min(1, "Payment date is required"),
  method: z.enum(["cash", "transfer", "card", "other"]),
  status: z.enum(["pending", "completed", "refunded", "failed"]),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPayment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Load enrollments for the selection dropdown
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
  });

  // Define form with zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentId: 0,
      amount: "",
      paymentDate: new Date().toISOString().split('T')[0],
      method: "cash",
      status: "pending",
      notes: null
    }
  });

  // Create mutation for submitting the form
  const createPaymentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/payments", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creating payment");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment created successfully",
        description: "The payment has been added to the system",
      });
      // Invalidate both payments cache and dashboard data to update statistics
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      navigate("/payments");
    },
    onError: (error) => {
      console.error("Error creating payment:", error);
      toast({
        title: "Error creating payment",
        description: error.message || "There was an error creating the payment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    createPaymentMutation.mutate(data);
  };

  return (
    <AppLayout title="Record New Payment">
      <div className="mb-8">
        <p className="text-gray-500">Record a new payment in the system</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter the information for the new payment
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="enrollmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      defaultValue={field.value ? field.value.toString() : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an enrollment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingEnrollments ? (
                          <SelectItem value="loading" disabled>Loading enrollments...</SelectItem>
                        ) : enrollments && enrollments.length > 0 ? (
                          enrollments.map((enrollment) => (
                            <SelectItem key={enrollment.id} value={enrollment.id.toString()}>
                              #{enrollment.id} - Program {enrollment.programId} - Child {enrollment.childId}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No enrollments available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the enrollment this payment is for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Payment amount" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Amount in dollars
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="transfer">Bank Transfer</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the payment was made
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
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The current status of the payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about this payment" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/payments")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingEnrollments || !enrollments || enrollments.length === 0}
              >
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}