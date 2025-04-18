<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-btn
              variant="text"
              prepend-icon="mdi-arrow-left"
              @click="goBack"
              class="mr-4"
            >
              Volver
            </v-btn>
            <v-icon class="mr-2">mdi-file-edit-outline</v-icon>
            Editar Documento
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="loading && !document">
      <v-col cols="12" class="d-flex justify-center align-center pa-8">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        <span class="ml-4 text-h6">Cargando documento...</span>
      </v-col>
    </v-row>

    <v-row v-else-if="document">
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-form ref="form" @submit.prevent="submitForm">
              <v-row>
                <!-- Título del documento -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.title"
                    label="Título del documento *"
                    variant="outlined"
                    :rules="[v => !!v || 'El título es obligatorio']"
                    required
                  ></v-text-field>
                </v-col>
                
                <!-- Tipo de documento -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.typeId"
                    :items="documentTypes"
                    item-title="name"
                    item-value="id"
                    label="Tipo de documento *"
                    variant="outlined"
                    :rules="[v => !!v || 'El tipo de documento es obligatorio']"
                    required
                  ></v-select>
                </v-col>
                
                <!-- Descripción del documento -->
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Descripción"
                    variant="outlined"
                    rows="3"
                    auto-grow
                  ></v-textarea>
                </v-col>
                
                <!-- Etiquetas -->
                <v-col cols="12">
                  <v-autocomplete
                    v-model="formData.tags"
                    :items="availableTags"
                    item-title="name"
                    item-value="id"
                    label="Etiquetas"
                    variant="outlined"
                    chips
                    multiple
                    closable-chips
                    return-object
                  ></v-autocomplete>
                </v-col>
                
                <!-- Metadatos -->
                <v-col cols="12">
                  <v-card class="mb-4">
                    <v-card-title class="text-subtitle-1">
                      <v-icon start>mdi-tag-text</v-icon>
                      Metadatos
                    </v-card-title>
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="formData.metadata.keywords"
                            label="Palabras clave"
                            variant="outlined"
                            hint="Separar palabras clave por comas"
                            persistent-hint
                          ></v-text-field>
                        </v-col>
                        
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="formData.metadata.department"
                            label="Departamento"
                            variant="outlined"
                          ></v-text-field>
                        </v-col>
                        
                        <v-col cols="12" md="6">
                          <v-menu
                            v-model="expirationDateMenu"
                            :close-on-content-click="false"
                            location="bottom"
                          >
                            <template v-slot:activator="{ props }">
                              <v-text-field
                                v-model="formData.metadata.expirationDate"
                                label="Fecha de expiración"
                                prepend-inner-icon="mdi-calendar"
                                readonly
                                v-bind="props"
                                variant="outlined"
                                clearable
                                @click:clear="formData.metadata.expirationDate = null"
                              ></v-text-field>
                            </template>
                            <v-date-picker
                              v-model="formData.metadata.expirationDate"
                              @update:model-value="expirationDateMenu = false"
                            ></v-date-picker>
                          </v-menu>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <!-- Información del archivo actual -->
                <v-col cols="12">
                  <v-alert
                    type="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <div class="d-flex align-center">
                      <v-icon class="mr-2">{{ getFileIcon(document.format) }}</v-icon>
                      <div>
                        <div class="text-subtitle-1">Archivo actual: {{ document.filePath.split('/').pop() }}</div>
                        <div class="text-caption">Formato: {{ document.format }}</div>
                      </div>
                    </div>
                  </v-alert>
                  
                  <!-- Opción para reemplazar el archivo -->
                  <v-expansion-panels variant="accordion">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <div class="d-flex align-center">
                          <v-icon class="mr-2">mdi-file-replace-outline</v-icon>
                          Reemplazar archivo
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-file-input
                          v-model="formData.file"
                          label="Nuevo archivo"
                          variant="outlined"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                          show-size
                          prepend-icon="mdi-file-upload-outline"
                          @change="handleFileChange"
                        ></v-file-input>
                        
                        <v-alert
                          v-if="formData.file"
                          type="info"
                          variant="tonal"
                          class="mt-2"
                        >
                          <div class="d-flex align-center">
                            <v-icon class="mr-2">{{ getFileIcon(formData.file) }}</v-icon>
                            <div>
                              <div>{{ formData.file.name }}</div>
                              <div class="text-caption">{{ formatFileSize(formData.file.size) }}</div>
                            </div>
                          </div>
                        </v-alert>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </v-col>
              </v-row>
              
              <v-divider class="my-4"></v-divider>
              
              <!-- Botones de acción -->
              <div class="d-flex justify-end">
                <v-btn
                  v-if="authStore.user?.role?.name === 'ADMIN'"
                  variant="text"
                  color="error"
                  @click="confirmDeleteDocument"
                  class="mr-auto"
                >
                  Eliminar Documento
                </v-btn>
                
                <v-btn
                  variant="text"
                  @click="resetForm"
                  class="mr-2"
                >
                  Cancelar
                </v-btn>
                
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="saving"
                  :disabled="saving"
                >
                  Guardar Cambios
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Mensaje de error si no se encuentra el documento -->
    <v-row v-else>
      <v-col cols="12">
        <v-alert
          type="error"
          title="Error"
          text="No se pudo encontrar el documento solicitado."
          class="mb-4"
        ></v-alert>
        <div class="text-center">
          <v-btn
            color="primary"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Volver a la lista de documentos
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Diálogo de confirmación para eliminar documento -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar eliminación</v-card-title>
        <v-card-text>
          <p class="mb-4">¿Está seguro que desea eliminar el documento "{{ document?.title }}"?</p>
          
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            Esta acción no se puede deshacer.
          </v-alert>

          <v-form ref="deleteForm" v-model="deleteFormValid">
            <v-text-field
              v-model="adminPassword"
              label="Contraseña de administrador"
              type="password"
              :rules="[v => !!v || 'La contraseña es requerida']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            @click="deleteDocument"
            :loading="loading"
            :disabled="!deleteFormValid"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDocumentsStore } from '@/store/documents';

// Stores y router
const documentsStore = useDocumentsStore();
const route = useRoute();
const router = useRouter();

// Referencias
const form = ref(null);
const deleteForm = ref(null);

// Estado del componente
const document = ref(null);
const documentTypes = ref([]);
const availableTags = ref([]);
const loading = ref(true);
const saving = ref(false);
const deleteDialog = ref(false);
const expirationDateMenu = ref(false);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});
const deleteFormValid = ref(false);
const adminPassword = ref('');

// Obtener el ID del documento de la URL
const documentId = computed(() => route.params.id);

// Datos del formulario
const formData = ref({
  title: '',
  description: '',
  typeId: null,
  tags: [],
  file: null,
  metadata: {
    keywords: '',
    department: '',
    expirationDate: null
  }
});

// Cargar datos iniciales
onMounted(async () => {
  try {
    loading.value = true;
    
    // Cargar el documento
    await loadDocument();
    
    // Cargar tipos de documentos
    documentTypes.value = await documentsStore.fetchDocumentTypes();
    
    // Cargar etiquetas disponibles
    availableTags.value = await documentsStore.fetchTags();
    
  } catch (error) {
    showError('Error al cargar los datos iniciales: ' + error.message);
  } finally {
    loading.value = false;
  }
});

// Observar cambios en el documento para actualizar el formulario
watch(document, (newDocument) => {
  if (newDocument) {
    formData.value = {
      title: newDocument.title || '',
      description: newDocument.description || '',
      typeId: newDocument.type ? newDocument.type.id : null,
      tags: newDocument.tags || [],
      file: null,
      metadata: {
        keywords: newDocument.metadata?.keywords || '',
        department: newDocument.metadata?.department || '',
        expirationDate: newDocument.metadata?.expirationDate || null
      }
    };
  }
}, { immediate: true });

// Métodos
async function loadDocument() {
  try {
    document.value = await documentsStore.fetchDocumentById(documentId.value);
    
    // Cargar metadatos
    const metadata = await documentsStore.fetchMetadata(documentId.value);
    document.value.metadata = metadata;
  } catch (error) {
    showError('Error al cargar el documento: ' + error.message);
    document.value = null;
  }
}

async function submitForm() {
  if (!form.value) return;
  
  const { valid } = await form.value.validate();
  
  if (!valid) {
    showError('Por favor, complete todos los campos obligatorios.');
    return;
  }
  
  try {
    saving.value = true;
    
    // Si hay un nuevo archivo, usar FormData
    if (formData.value.file) {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.value.file);
      formDataToSend.append('title', formData.value.title);
      formDataToSend.append('description', formData.value.description || '');
      formDataToSend.append('typeId', formData.value.typeId);
      
      // Agregar etiquetas si existen
      if (formData.value.tags && formData.value.tags.length > 0) {
        formData.value.tags.forEach((tag, index) => {
          formDataToSend.append(`tags[${index}].id`, tag.id);
          formDataToSend.append(`tags[${index}].name`, tag.name);
        });
      }
      
      // Agregar metadatos
      formDataToSend.append('metadata.keywords', formData.value.metadata.keywords || '');
      formDataToSend.append('metadata.department', formData.value.metadata.department || '');
      formDataToSend.append('metadata.expirationDate', formData.value.metadata.expirationDate || '');
      
      await documentsStore.updateDocument(documentId.value, formDataToSend);
    } else {
      // Si no hay nuevo archivo, enviar JSON
      const updateData = {
        title: formData.value.title,
        description: formData.value.description || '',
        typeId: formData.value.typeId,
        tags: formData.value.tags || [],
        metadata: {
          keywords: formData.value.metadata.keywords || '',
          department: formData.value.metadata.department || '',
          expirationDate: formData.value.metadata.expirationDate || ''
        }
      };
      
      await documentsStore.updateDocument(documentId.value, updateData);
    }
    
    showSuccess('Documento actualizado correctamente.');
    
    // Recargar el documento para mostrar los cambios
    await loadDocument();
    
    // Redirigir a la página de detalles después de un breve retraso
    setTimeout(() => {
      router.push(`/documents/${documentId.value}`);
    }, 1500);
    
  } catch (error) {
    showError('Error al actualizar el documento: ' + error.message);
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  if (document.value) {
    formData.value = {
      title: document.value.title || '',
      description: document.value.description || '',
      typeId: document.value.type ? document.value.type.id : null,
      tags: document.value.tags || [],
      file: null,
      metadata: {
        keywords: document.value.metadata?.keywords || '',
        department: document.value.metadata?.department || '',
        expirationDate: document.value.metadata?.expirationDate || null
      }
    };
  }
  
  if (form.value) {
    form.value.resetValidation();
  }
}

function handleFileChange(file) {
  console.log('Nuevo archivo seleccionado:', file);
}

function goBack() {
  router.back();
}

function confirmDeleteDocument() {
  deleteDialog.value = true;
}

async function deleteDocument() {
  try {
    loading.value = true;
    await documentsStore.deleteDocument(documentId.value);
    showSuccess(`Documento "${document.value.title}" eliminado correctamente.`);
    deleteDialog.value = false;
    
    // Redirigir a la lista de documentos después de eliminar
    setTimeout(() => {
      router.push('/search-documents');
    }, 1500);
  } catch (error) {
    showError('Error al eliminar el documento: ' + error.message);
  } finally {
    loading.value = false;
  }
}

// Utilidades
function getFileIcon(fileOrFormat) {
  if (!fileOrFormat) return 'mdi-file-outline';
  
  let extension;
  
  if (typeof fileOrFormat === 'string') {
    // Si es un string (formato)
    extension = fileOrFormat.toLowerCase();
  } else {
    // Si es un objeto File
    extension = fileOrFormat.name.split('.').pop().toLowerCase();
  }
  
  const iconMap = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-outline',
    docx: 'mdi-file-word-outline',
    xls: 'mdi-file-excel-outline',
    xlsx: 'mdi-file-excel-outline',
    ppt: 'mdi-file-powerpoint-outline',
    pptx: 'mdi-file-powerpoint-outline',
    jpg: 'mdi-file-image-outline',
    jpeg: 'mdi-file-image-outline',
    png: 'mdi-file-image-outline',
    txt: 'mdi-file-document-outline'
  };
  
  return iconMap[extension] || 'mdi-file-outline';
}

function formatFileSize(size) {
  if (size < 1024) {
    return size + ' bytes';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

function showSuccess(message) {
  snackbar.value = {
    show: true,
    text: message,
    color: 'success',
    timeout: 3000
  };
}

function showError(message) {
  snackbar.value = {
    show: true,
    text: message,
    color: 'error',
    timeout: 5000
  };
}
</script>
