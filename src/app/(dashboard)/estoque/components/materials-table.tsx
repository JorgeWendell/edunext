"use client";

import {
  ArrowDown,
  ArrowUp,
  Edit,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addMaterialMovement,
} from "@/actions/materials";
import { MaterialForm } from "./material-form";
import { MaterialMovementDialog } from "./material-movement-dialog";

interface Material {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  quantity: number;
  minQuantity: number | null;
  unit: string;
  price: string | null;
  supplier: string | null;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialsTableProps {
  materials: Material[];
}

export function MaterialsTable({ materials }: MaterialsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createMaterial(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Material criado com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      const result = await updateMaterial({
        ...values,
        id: selectedMaterial.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Material atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (material: Material) => {
    if (
      !confirm(`Tem certeza que deseja excluir o material ${material.name}?`)
    ) {
      return;
    }

    try {
      const result = await deleteMaterial({ id: material.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Material excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir material");
    }
  };

  const handleMovement = async (values: any) => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      const result = await addMaterialMovement({
        ...values,
        materialId: selectedMaterial.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success(
        `${values.type === "entry" ? "Entrada" : "Saída"} registrada com sucesso!`,
      );
      setIsMovementDialogOpen(false);
      setSelectedMaterial(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao registrar movimentação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsEditDialogOpen(true);
  };

  const openMovementDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsMovementDialogOpen(true);
  };

  const formatPrice = (price: string | null) => {
    if (!price) return "Não informado";
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const getStockStatus = (quantity: number, minQuantity: number | null) => {
    if (minQuantity === null || minQuantity === 0) return null;
    if (quantity <= minQuantity) {
      return {
        label: "Estoque Baixo",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      };
    }
    if (quantity <= minQuantity * 1.5) {
      return {
        label: "Atenção",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      };
    }
    return {
      label: "Normal",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, categoria ou fornecedor..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gray-600 hover:bg-gray-700">
              <Plus className="h-4 w-4" />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Material</DialogTitle>
            </DialogHeader>
            <MaterialForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold">Material</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Quantidade</TableHead>
                <TableHead className="font-semibold">Unidade</TableHead>
                <TableHead className="font-semibold">Preço</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum material cadastrado
                      </p>
                      <p className="text-sm">
                        Comece adicionando um novo material
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material) => {
                  const stockStatus = getStockStatus(
                    material.quantity,
                    material.minQuantity,
                  );
                  return (
                    <TableRow
                      key={material.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            <span className="text-xs font-semibold">
                              {material.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div>{material.name}</div>
                            {material.location && (
                              <div className="text-muted-foreground text-xs">
                                {material.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.category || "Sem categoria"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${
                            stockStatus?.className.includes("red")
                              ? "text-red-600 dark:text-red-400"
                              : stockStatus?.className.includes("yellow")
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {material.quantity}
                        </span>
                        {material.minQuantity !== null &&
                          material.minQuantity > 0 && (
                            <div className="text-muted-foreground text-xs">
                              Mín: {material.minQuantity}
                            </div>
                          )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {material.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatPrice(material.price)}
                      </TableCell>
                      <TableCell>
                        {stockStatus ? (
                          <Badge className={stockStatus.className}>
                            {stockStatus.label}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
                            Normal
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openMovementDialog(material)}
                              className="cursor-pointer"
                            >
                              <ArrowUp className="mr-2 h-4 w-4 text-green-600" />
                              Entrada/Saída
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditDialog(material)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-gray-600" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(material)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedMaterial && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
            </DialogHeader>
            <MaterialForm
              isEdit
              defaultValues={{
                name: selectedMaterial.name,
                description: selectedMaterial.description || "",
                category: selectedMaterial.category || "",
                quantity: selectedMaterial.quantity,
                minQuantity: selectedMaterial.minQuantity || 0,
                unit: selectedMaterial.unit,
                price: selectedMaterial.price
                  ? formatPrice(selectedMaterial.price)
                  : "",
                supplier: selectedMaterial.supplier || "",
                location: selectedMaterial.location || "",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedMaterial(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>

      <Dialog
        open={isMovementDialogOpen}
        onOpenChange={setIsMovementDialogOpen}
      >
        {selectedMaterial && (
          <MaterialMovementDialog
            materialId={selectedMaterial.id}
            materialName={selectedMaterial.name}
            currentQuantity={selectedMaterial.quantity}
            onSubmit={handleMovement}
            onCancel={() => {
              setIsMovementDialogOpen(false);
              setSelectedMaterial(null);
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </Dialog>
    </>
  );
}
