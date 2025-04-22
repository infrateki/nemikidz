import { useState, useEffect } from "react";
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
import { insertChildSchema, type InsertChild, type Parent } from "@shared/schema";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewChild() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Load parents for the parent selection dropdown
  const { data: parents, isLoading: isLoadingParents } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
  });

  // Define form with zod validation
  const form = useForm<InsertChild>({
    resolver: zodResolver(insertChildSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
      parentId: 0,
      allergies: "",
      medicalNotes: "",
      notes: ""
    }
  });

  // Create mutation for submitting the form
  const createChildMutation = useMutation({
    mutationFn: async (data: InsertChild) => {
      const res = await apiRequest("POST", "/api/children", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error creating child record");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Child record created successfully",
        description: "The child has been added to the system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/children'] });
      navigate("/children");
    },
    onError: (error) => {
      console.error("Error creating child record:", error);
      toast({
        title: "Error creating child record",
        description: error.message || "There was an error creating the child record",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });

  // Form submission handler
  const onSubmit = (data: InsertChild) => {
    setIsSubmitting(true);
    createChildMutation.mutate(data);
  };

  // Check if we have parents, if not, show a toast notification
  useEffect(() => {
    if (!isLoadingParents && (!parents || parents.length === 0)) {
      toast({
        title: "No parents in system",
        description: "You need to add a parent before adding a child",
        variant: "warning",
      });
    }
  }, [parents, isLoadingParents, toast]);

  return (
    <AppLayout title="Add New Child">
      <div className="mb-8">
        <p className="text-gray-500">Register a new child in the system</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>
            Enter the child's personal information
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Child's first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Child's last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
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
                          selected={new Date(field.value)}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) => date > new Date()}
                          captionLayout="dropdown-buttons"
                          fromYear={2000}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              {parent.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No parents available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the parent or guardian for this child
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any allergies or 'None' if not applicable" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="medicalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any medical conditions or specific health requirements" 
                        className="min-h-[80px]" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any other important information about the child" 
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
              <Button variant="outline" type="button" onClick={() => navigate("/children")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoadingParents || !parents || parents.length === 0}
              >
                {isSubmitting ? "Creating..." : "Register Child"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </AppLayout>
  );
}